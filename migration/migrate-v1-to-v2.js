#!/usr/bin/env node
/**
 * OSASS v1 (MongoDB/Node.js) → v2 (PostgreSQL/.NET) Data Migration
 *
 * V1 Schema (mongoose field names, verified from codebase):
 *   users        - { firstname, lastname, othername, email, phone, position, residence,
 *                    department (ObjectId ref), rank, title, alt_rank, committee_rank,
 *                    date_joined, changed_password }
 *   auths        - { email, password (bcrypt) }  — same _id as corresponding user
 *   faculties    - { name, acronyme, about_faculty, dean (ref user), email, phone }
 *   departments  - { name, acronyme, about_department, email, phone, faculty (ref), hod (ref user) }
 *   applications - promotion rounds/positions { name (UPPERCASE), description, type }
 *   smapplications - individual SMA (Senior Member Academic) applications:
 *                    { staff (ref user), application (ref applications),
 *                      curriculum_vitae (full URL string), application_letter (full URL string),
 *                      status ("Submitted to DAPC/FAPC/UAPC" or "Completed - Applicant Promoted/Denied"),
 *                      application_status, hod_status (bool), dapc_status (bool),
 *                      fapsc_status (bool), uapc_status (bool), date_submitted }
 *
 * Committee membership is embedded in User.rank (no separate collection):
 *   rank "dapc"               → DAPC member  (dept scope from user.department)
 *   rank "fapsc"              → FAPC member  (faculty scope from user.dept.faculty)
 *   rank "uapc"               → UAPC member
 *   committee_rank "uapc"     → also UAPC member
 *   title "hod"               → DAPC chairperson  (dept scope)
 *   title "dean"              → FAPC chairperson  (faculty scope)
 *
 * V1 uploaded files:
 *   stored flat in {server_root}/public/data/{timestamp-name}.pdf
 *   curriculum_vitae / application_letter fields store the full URL
 *   e.g. "https://45.222.48.22/public/data/1680000000000-john-doe-cv.pdf"
 *
 * V2 Schema (PostgreSQL / EF Core):
 *   OsassIdentityDb (public schema):   Schools, Faculties, Departments, Staffs, Admins
 *   AcademicPromotionDb (public schema): AcademicPromotionPositions,
 *                                        AcademicPromotionApplications,
 *                                        AcademicPromotionCommittees
 *   NonAcademicPromotionDb (public schema): NonAcademicPromotionPositions etc.
 *   The identity/academicPromotion/nonAcademicPromotion PG schemas only contain
 *   __EFMigrationsHistory — data tables live in the public schema of each DB.
 *
 * NOTE: The BSON dump files provided were corrupted (all null bytes).
 *       This script defaults to a direct MongoDB connection (MONGO_URI).
 *       Set USE_BSON_FILES=true and MONGO_DUMP_DIR to use BSON files instead
 *       (only useful if you obtain a fresh uncorrupted dump).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const env = process.env;

// ─── Config ────────────────────────────────────────────────────────────────────
const MONGO_URI      = env.MONGO_URI || 'mongodb://localhost:27017/LiveOsassDB';
const PG_IDENTITY    = env.PG_IDENTITY_CONNECTION;    // OsassIdentityDb
const PG_ACADEMIC    = env.PG_ACADEMIC_CONNECTION;    // AcademicPromotionDb
const OLD_FILES_ROOT = env.OLD_FILES_ROOT || '';
const S3_ENDPOINT    = env.MINIO_ENDPOINT || '';
const S3_KEY         = env.MINIO_ACCESS_KEY || '';
const S3_SECRET      = env.MINIO_SECRET_KEY || '';
const S3_BUCKET      = env.MINIO_BUCKET || 'osass';
const S3_FOLDER      = env.MINIO_FOLDER || 'legacy';
const DRY_RUN        = env.DRY_RUN === 'true';
const DEFAULT_SCHOOL = env.DEFAULT_SCHOOL_NAME || 'University of Mines and Technology';
const CONCURRENCY    = env.CONCURRENCY ? parseInt(env.CONCURRENCY, 10) : 100;
const UPLOAD_RETRIES = env.UPLOAD_RETRIES ? parseInt(env.UPLOAD_RETRIES, 10) : 3;

/**
 * Retry an async fn up to `retries` times with exponential back-off.
 * Doubles the delay after each failure: 1 s, 2 s, 4 s, …
 */
async function withRetry(fn, retries = UPLOAD_RETRIES, delayMs = 1000) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (attempt < retries) {
        const wait = delayMs * Math.pow(2, attempt);
        console.warn(`  [retry ${attempt + 1}/${retries}] ${e.message} — waiting ${wait}ms`);
        await new Promise(res => setTimeout(res, wait));
      }
    }
  }
  throw lastErr;
}

/**
 * Run an array of async task-factories with at most `limit` running at the same time.
 * Returns results in input order.
 */
async function runConcurrent(tasks, limit = CONCURRENCY) {
  const results = [];
  for (let i = 0; i < tasks.length; i += limit) {
    const batchResults = await Promise.all(tasks.slice(i, i + limit).map(fn => fn()));
    results.push(...batchResults);
  }
  return results;
}

let _s3Client = null;  // singleton — reused across all uploads to avoid per-call client creation

const EXCLUDE_KEYWORDS = [];
const excludedFacultyIds = new Set();
const excludedDeptIds = new Set();
const excludedUserIds = new Set();

function containsExcludeKeyword(value) {
  return false;
}

function shouldExcludeText(...values) {
  return false;
}

// ID maps: v1 ObjectId hex → v2 GUID (populated as each phase runs)
const schoolIdMap      = {};
const facultyIdMap     = {};
const deptIdMap        = {};
const userIdMap        = {};
const positionIdMap      = {};
const positionNameMap    = {};  // v1 application._id → position name (e.g. "PROFESSOR")
const positionCriteriaMap = {}; // v1 application._id → PerformanceCriteria array
const applicationIdMap = {};  // v1 smapplication._id → v2 AcademicPromotionApplication.Id
const appContextMap    = {};  // v1 smapplication._id → { positionId, applicantId, deptId, facId }

let DEFAULT_SCHOOL_ID = null;

const uploadStats = {
  attempted: 0,
  succeeded: 0,
  missingFilename: 0,
  noS3Config: 0,
  noOldFilesRoot: 0,
  notFound: 0,
  failed: 0,
  failures: [],
};
const MAX_UPLOAD_FAILURES = 100;

function printUploadSummary() {
  console.log('\n[Upload Summary]');
  console.log(`  Attempted: ${uploadStats.attempted}`);
  console.log(`  Succeeded: ${uploadStats.succeeded}`);
  const notUploaded = uploadStats.missingFilename + uploadStats.noS3Config + uploadStats.noOldFilesRoot + uploadStats.notFound + uploadStats.failed;
  console.log(`  Not uploaded: ${notUploaded}`);
  if (uploadStats.missingFilename) console.log(`    Missing filename references: ${uploadStats.missingFilename}`);
  if (uploadStats.noS3Config) console.log(`    Skipped due to missing S3 config: ${uploadStats.noS3Config}`);
  if (uploadStats.noOldFilesRoot) console.log(`    Skipped due to missing OLD_FILES_ROOT: ${uploadStats.noOldFilesRoot}`);
  if (uploadStats.notFound) console.log(`    Local file not found: ${uploadStats.notFound}`);
  if (uploadStats.failed) console.log(`    Upload failed: ${uploadStats.failed}`);
  if (uploadStats.failures.length) {
    console.log('  Failure details (first entries):');
    for (const failure of uploadStats.failures) {
      console.log(`    - ${failure.filename}: ${failure.reason}${failure.detail ? ` (${failure.detail})` : ''}`);
    }
    if (uploadStats.failures.length >= MAX_UPLOAD_FAILURES) {
      console.log(`    ...plus more failures not shown (max ${MAX_UPLOAD_FAILURES})`);
    }
  }
}

function assertEnv() {
  const missing = [];
  if (!PG_IDENTITY) missing.push('PG_IDENTITY_CONNECTION');
  if (!PG_ACADEMIC) missing.push('PG_ACADEMIC_CONNECTION');
  if (missing.length) {
    console.error('ERROR: Missing env vars:', missing.join(', '));
    console.error('Copy .env.example → .env and fill in the connection strings.');
    process.exit(1);
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
function newGuid() {
  return crypto.randomBytes(16).toString('hex'); // 32-char hex = Guid.ToString("N")
}

function objId(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value.toHexString === 'function') return value.toHexString();
  if (value.$oid) return value.$oid;
  return String(value);
}

function formatDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value.toISOString();
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function normalizeEmail(raw) {
  if (!raw) return null;
  return String(raw).trim().toLowerCase();
}

/**
 * v1 stores the full name (with honorific) in the `firstname` field, e.g.:
 *   "PROF BERNARD KUMI-BOATENG", "ASSOC PROF MICHAEL AFFAM", "DR MRS ETORNAM BANI FIADONU"
 * Strip leading title words, then first remaining word → FirstName, rest → LastName.
 */
const TITLE_WORDS = new Set(['PROF', 'PROF.', 'DR', 'DR.', 'MR', 'MR.', 'MRS', 'MRS.', 'MS', 'MS.', 'MISS', 'ASSOC', 'PFOF', 'REV', 'ENG', 'ENGR']);
function parseFullName(fullName) {
  const words = (fullName || '').trim().split(/\s+/).filter(Boolean);
  const titleParts = [];
  while (words.length > 0 && TITLE_WORDS.has(words[0].toUpperCase())) {
    titleParts.push(words.shift());
  }
  const firstName = words.shift() || '';
  const lastName  = words.join(' ');
  return { title: titleParts.length ? `${titleParts.join(' ')}.` : '', firstName, lastName };
}

/** Extract just the filename from a v1 file URL.
 * v1 stored files as: "https://host/public/data/1680000000000-name.pdf" */
function extractFilename(fileValue) {
  if (!fileValue) return null;
  return path.basename(String(fileValue).trim().replace(/\\/g, '/'));
}

async function uploadLegacyFile(filename) {
  if (!filename) {
    uploadStats.missingFilename++;
    return null;
  }
  if (!S3_ENDPOINT || !S3_KEY || !S3_SECRET) {
    uploadStats.noS3Config++;
    return filename;
  }
  if (!OLD_FILES_ROOT) {
    uploadStats.noOldFilesRoot++;
    return filename;
  }
  let S3Client, PutObjectCommand;
  try {
    ({ S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'));
  } catch (_) {
    console.warn('  [warn] @aws-sdk/client-s3 not installed; skipping upload');
    uploadStats.noS3Config++;
    return filename;
  }
  const localPath = path.join(OLD_FILES_ROOT, filename);
  if (!fs.existsSync(localPath)) {
    uploadStats.notFound++;
    if (uploadStats.failures.length < MAX_UPLOAD_FAILURES) {
      uploadStats.failures.push({ filename, reason: 'Local file not found' });
    }
    console.warn(`  [warn] File not found locally: ${localPath}`);
    return filename;
  }
  uploadStats.attempted++;
  const objectKey = `${S3_FOLDER}/${filename}`;
  const ext = path.extname(filename).toLowerCase();
  const contentType = { '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg' }[ext] || 'application/octet-stream';
  if (!_s3Client) {
    _s3Client = new S3Client({
      endpoint: S3_ENDPOINT, region: 'us-east-1',
      credentials: { accessKeyId: S3_KEY, secretAccessKey: S3_SECRET },
      forcePathStyle: true,
    });
  }
  try {
    await withRetry(() => _s3Client.send(new PutObjectCommand({
      Bucket: S3_BUCKET, Key: objectKey,
      Body: fs.createReadStream(localPath),
      ContentType: contentType, ACL: 'public-read',
    })));
    uploadStats.succeeded++;
    console.log(`  [upload] ${filename} → ${objectKey}`);
    return filename;
  } catch (e) {
    uploadStats.failed++;
    if (uploadStats.failures.length < MAX_UPLOAD_FAILURES) {
      uploadStats.failures.push({ filename, reason: 'Upload failed', detail: e.message });
    }
    console.warn(`  [warn] Upload failed for ${filename}: ${e.message}`);
    return filename;
  }
}

async function pgInsert(pgClient, table, rows, columns) {
  if (!rows.length) return;
  if (DRY_RUN) { console.log(`  [dry-run] Would insert ${rows.length} rows into ${table}`); return; }
  const BATCH = 200;
  await runConcurrent(
    Array.from({ length: Math.ceil(rows.length / BATCH) }, (_, i) => async () => {
      const batch = rows.slice(i * BATCH, (i + 1) * BATCH);
      const vals = [];
      const phs = batch.map(row => {
        const ph = columns.map((col) => { vals.push(row[col]); return `$${vals.length}`; });
        return `(${ph.join(', ')})`;
      });
      const cols = columns.map(c => `"${c}"`).join(', ');
      await pgClient.query(`INSERT INTO ${table} (${cols}) VALUES ${phs.join(', ')} ON CONFLICT ("Id") DO NOTHING`, vals);
    }),
    5,  // 5 concurrent DB insert batches
  );
}

// \u2500\u2500\u2500 Migration phases \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

/** Phase 1: Create the UMaT school record */
async function phase1_school(pgId) {
  console.log('\n[1] Creating School...');
  DEFAULT_SCHOOL_ID = newGuid();
  await pgInsert(pgId, '"Schools"',
    [{ Id: DEFAULT_SCHOOL_ID, Name: DEFAULT_SCHOOL, CreatedAt: new Date().toISOString(), UpdatedAt: null, CreatedBy: 'migration', UpdatedBy: null }],
    ['Id', 'Name', 'CreatedAt', 'UpdatedAt', 'CreatedBy', 'UpdatedBy']);
  console.log(`   "${DEFAULT_SCHOOL}" \u2192 ${DEFAULT_SCHOOL_ID}`);
}

/** Phase 2: v1 faculties \u2192 identity.Faculties */
async function phase2_faculties(pgId, db) {
  console.log('\n[2] Migrating Faculties...');
  const docs = await db.collection('faculties').find({}).toArray();
  console.log(`   Found ${docs.length}`);
  const rows = [];
  for (const d of docs) {
    if (shouldExcludeText(d.name)) {
      excludedFacultyIds.add(objId(d._id));
      continue;
    }
    const v2Id = newGuid();
    facultyIdMap[objId(d._id)] = v2Id;
    rows.push({ Id: v2Id, Name: d.name || '', SchoolId: DEFAULT_SCHOOL_ID,
             CreatedAt: formatDate(d.createdAt) || new Date().toISOString(), UpdatedAt: formatDate(d.updatedAt) || null,
             CreatedBy: 'migration', UpdatedBy: null });
  }
  await pgInsert(pgId, '"Faculties"', rows, ['Id', 'Name', 'SchoolId', 'CreatedAt', 'UpdatedAt', 'CreatedBy', 'UpdatedBy']);
  console.log(`   Inserted ${rows.length}`);
  console.log(`   Skipped ${excludedFacultyIds.size} faculties matching exclude keywords`);
}

/** Phase 3: v1 departments \u2192 identity.Departments */
async function phase3_departments(pg, db) {
  console.log('\n[3] Migrating Departments...');
  const docs = await db.collection('departments').find({}).toArray();
  console.log(`   Found ${docs.length}`);
  const rows = [];
  for (const d of docs) {
    const v1FacultyId = objId(d.faculty);
    if (shouldExcludeText(d.name) || (v1FacultyId && excludedFacultyIds.has(v1FacultyId))) {
      excludedDeptIds.add(objId(d._id));
      continue;
    }
    const v2Id = newGuid();
    deptIdMap[objId(d._id)] = v2Id;
    rows.push({ Id: v2Id, Name: d.name || '',
             SchoolId: DEFAULT_SCHOOL_ID,
             FacultyId: facultyIdMap[objId(d.faculty)] || null,
             DepartmentType: 'Academic',
             CreatedAt: formatDate(d.createdAt) || new Date().toISOString(), UpdatedAt: formatDate(d.updatedAt) || null,
             CreatedBy: 'migration', UpdatedBy: null });
  }
  await pgInsert(pg, '"Departments"', rows, ['Id', 'Name', 'SchoolId', 'FacultyId', 'DepartmentType', 'CreatedAt', 'UpdatedAt', 'CreatedBy', 'UpdatedBy']);
  console.log(`   Inserted ${rows.length}`);
  console.log(`   Skipped ${excludedDeptIds.size} departments matching exclude keywords or excluded faculties`);
  // Return dept\u2192faculty map for later use
  const deptToFaculty = {};
  for (const d of docs) deptToFaculty[objId(d._id)] = objId(d.faculty);
  return deptToFaculty;
}

/** Phase 4: v1 users (+ auths for passwords) \u2192 identity.Staffs + identity.Admins
 *  Returns committeeUsers array for Phase 5. */
async function phase4_users(pgId, db, deptToFaculty) {
  console.log('\n[4] Migrating Users \u2192 Staffs + Admins...');
  const authDocs = await db.collection('auths').find({}).toArray();
  const authMap = {};
  for (const a of authDocs) authMap[objId(a._id)] = a.password || '';
  console.log(`   Loaded ${authDocs.length} auth records`);

  const userDocs = await db.collection('users').find({}).toArray();
  console.log(`   Found ${userDocs.length} users`);

  // Pre-build a map of v1 staff _id → latest completed application date
  // Used to intelligently set LastAppointmentOrPromotionDate instead of defaulting to migration run date
  const allSmApps = await db.collection('smapplications').find({}).toArray();
  const lastPromotionDateByStaff = {};
  const lastApplicationDateByStaff = {};
  for (const app of allSmApps) {
    const staffV1Id = objId(app.staff);
    if (!staffV1Id) continue;
    // Track latest submission date for any application
    const submittedDate = app.date_submitted ? new Date(app.date_submitted) : null;
    if (submittedDate && !isNaN(submittedDate.getTime())) {
      if (!lastApplicationDateByStaff[staffV1Id] || submittedDate > lastApplicationDateByStaff[staffV1Id]) {
        lastApplicationDateByStaff[staffV1Id] = submittedDate;
      }
    }
    // Track latest completed (promoted) application date separately.
    // Also treat "denied but UAPC completed" as effectively promoted (user instruction).
    const isDenied = /denied|not.approved/i.test(app.status || '') || /denied|not.approved/i.test(app.application_status || '');
    const isPromoted = /promot/i.test(app.status || '') || /promot/i.test(app.application_status || '')
      || (isDenied && app.uapc_status === true);
    if (isPromoted && submittedDate && !isNaN(submittedDate.getTime())) {
      if (!lastPromotionDateByStaff[staffV1Id] || submittedDate > lastPromotionDateByStaff[staffV1Id]) {
        lastPromotionDateByStaff[staffV1Id] = submittedDate;
      }
    }
  }
  console.log(`   Found last promotion dates for ${Object.keys(lastPromotionDateByStaff).length} staff from completed applications`);
  console.log(`   Found last application dates for ${Object.keys(lastApplicationDateByStaff).length} staff from any application`);

  const staffRows = [], adminRows = [], committeeUsers = [];

  for (const u of userDocs) {
    const v1Id = objId(u._id);
    const email = normalizeEmail(u.email);
    const rank  = (u.rank  || '').toLowerCase();
    const title = (u.title || '').toLowerCase();
    const v1DeptId = objId(u.department);
    const v1FacId  = v1DeptId ? deptToFaculty[v1DeptId] : null;
    const deptExcluded = v1DeptId && excludedDeptIds.has(v1DeptId);
    const facExcluded = v1FacId && excludedFacultyIds.has(v1FacId);
    const userText = [u.firstname, u.othername, u.lastname, u.email, u.position, u.title, u.rank, u.committee_rank].join(' ');
    if (!email) {
      console.warn(`   [skip] user ${v1Id} has no email`);
      excludedUserIds.add(v1Id);
      continue;
    }
    if (deptExcluded || facExcluded || shouldExcludeText(userText)) {
      excludedUserIds.add(v1Id);
      continue;
    }

    const v2Id = newGuid();
    userIdMap[v1Id] = v2Id;
    const v2DeptId = v1DeptId ? (deptIdMap[v1DeptId] || '') : '';
    const v2FacId  = v1FacId  ? (facultyIdMap[v1FacId] || null) : null;
    const password = authMap[v1Id] || '';

    const parsed = parseFullName(u.firstname);

    if (rank === 'admin') {
      adminRows.push({ Id: v2Id, FirstName: parsed.firstName, LastName: parsed.lastName,
                       Email: email, Password: password, Role: 'Admin', LastLoginAt: null,
                       CreatedAt: formatDate(u.createdAt) || new Date().toISOString(), UpdatedAt: formatDate(u.updatedAt) || null,
                       CreatedBy: 'migration', UpdatedBy: null });
    } else {
      staffRows.push({ Id: v2Id, Email: email,
                       FirstName: parsed.firstName,
                       LastName: parsed.lastName,
                       StaffId: email.split('@')[0].toUpperCase(),
                       Position: (u.position || '').toUpperCase(),
                       PreviousPosition: '',
                       Title: parsed.title,
                       LastAppointmentOrPromotionDate: lastPromotionDateByStaff[v1Id]
                         ? lastPromotionDateByStaff[v1Id].toISOString()
                         : lastApplicationDateByStaff[v1Id]
                           ? lastApplicationDateByStaff[v1Id].toISOString()
                           : (formatDate(u.date_joined) || new Date().toISOString()),
                       StaffCategory: 'Academic',
                       UniversityRole: null,
                       Password: password,
                       LastLoginAt: null,
                       DepartmentId: v2DeptId,
                       FacultyId: v2FacId,
                       SchoolId: DEFAULT_SCHOOL_ID,
                       CreatedAt: formatDate(u.createdAt) || new Date().toISOString(), UpdatedAt: formatDate(u.updatedAt) || null,
                       CreatedBy: 'migration', UpdatedBy: null });
    }

    if (['dapc', 'fapsc', 'uapc'].includes(rank) || (u.committee_rank || '').toLowerCase() === 'uapc'
        || ['hod', 'dean'].includes(title)) {
      committeeUsers.push({ v1DeptId, v2Id, v2DeptId, v2FacId, rank, title,
                            committee_rank: (u.committee_rank || '').toLowerCase() });
    }
  }

  await pgInsert(pgId, '"Staffs"', staffRows, [
    'Id', 'Email', 'FirstName', 'LastName', 'StaffId', 'Position', 'PreviousPosition',
    'LastAppointmentOrPromotionDate', 'Title', 'StaffCategory', 'UniversityRole',
    'Password', 'LastLoginAt', 'DepartmentId', 'FacultyId', 'SchoolId',
    'CreatedAt', 'UpdatedAt', 'CreatedBy', 'UpdatedBy',
  ]);
  console.log(`   Inserted ${staffRows.length} staff`);

  return committeeUsers;
}

/** Phase 5: Derive Academic Committee membership from user.rank / user.title */
async function phase5_committees(pgAcad, committeeUsers) {
  console.log('\n[5] Deriving Academic Committee members from user ranks...');
  const rows = [];
  for (const { v2Id, v2DeptId, v2FacId, rank, title, committee_rank } of committeeUsers) {
    let type = null, chair = false, deptId = null, facId = null, schoolId = null;
    if (rank === 'dapc')   { type = 'DAPC'; deptId = v2DeptId || null; }
    if (rank === 'fapsc')  { type = 'FAPC'; facId  = v2FacId  || null; }
    if (rank === 'uapc' || committee_rank === 'uapc') { type = 'UAPC'; schoolId = DEFAULT_SCHOOL_ID; }
    if (title === 'hod')   { type = type || 'DAPC'; chair = true; deptId = v2DeptId || null; }
    if (title === 'dean')  { type = type || 'FAPC'; chair = true; facId  = v2FacId  || null; }
    if (!type) continue;
    rows.push({ Id: newGuid(), StaffId: v2Id, CommitteeType: type,
                CanSubmitReviewedApplication: chair, IsChairperson: chair,
                DepartmentId: deptId, FacultyId: facId, SchoolId: schoolId,
                CreatedAt: new Date().toISOString(), UpdatedAt: null, CreatedBy: 'migration', UpdatedBy: null });
  }
  await pgInsert(pgAcad, '"AcademicPromotionCommittees"', rows, [
    'Id', 'StaffId', 'CommitteeType', 'CanSubmitReviewedApplication', 'IsChairperson',
    'DepartmentId', 'FacultyId', 'SchoolId', 'CreatedAt', 'UpdatedAt', 'CreatedBy', 'UpdatedBy',
  ]);
  console.log(`   Inserted ${rows.length} committee rows`);
}

/** Phase 6: v1 applications (promotion rounds) \u2192 AcademicPromotionPositions */
async function phase6_positions(pgAcad, db) {
  console.log('\n[6] Migrating Promotion Positions (v1: applications collection)...');
  const docs = await db.collection('applications').find({}).toArray();
  console.log(`   Found ${docs.length}`);
  const rows = docs.map(d => {
    const v2Id = newGuid();
    positionIdMap[objId(d._id)] = v2Id;
    positionNameMap[objId(d._id)] = d.name || '';
    const req = getPositionRequirements(d.name);
    positionCriteriaMap[objId(d._id)] = req.criteria;
    return { Id: v2Id, Name: d.name || '',
             PerformanceCriteria: JSON.stringify(req.criteria),
             MinimumNumberOfYearsFromLastPromotion: req.minYears,
             PreviousPosition: req.previousPosition,
             MinimumNumberOfPublications: req.minPubs,
             MinimumNumberOfRefereedJournal: req.minRefereed,
             CreatedAt: formatDate(d.createdAt) || new Date().toISOString(), UpdatedAt: formatDate(d.updatedAt) || null,
             CreatedBy: 'migration', UpdatedBy: null };
  });
  await pgInsert(pgAcad, '"AcademicPromotionPositions"', rows, [
    'Id', 'Name', 'PerformanceCriteria', 'MinimumNumberOfYearsFromLastPromotion',
    'PreviousPosition', 'MinimumNumberOfPublications', 'MinimumNumberOfRefereedJournal',
    'CreatedAt', 'UpdatedAt', 'CreatedBy', 'UpdatedBy',
  ]);
  console.log(`   Inserted ${rows.length}`);
}

/** Phase 7: v1 smapplications \u2192 AcademicPromotionApplications */
async function phase7_applications(pgAcad, db) {
  console.log('\n[7] Migrating SMA Applications...');
  const [appDocs, userDocs, deptDocs, facDocs] = await Promise.all([
    db.collection('smapplications').find({}).toArray(),
    db.collection('users').find({}).toArray(),
    db.collection('departments').find({}).toArray(),
    db.collection('faculties').find({}).toArray(),
  ]);
  const userMap = {}, deptMap = {}, facMap = {};
  for (const u of userDocs) userMap[objId(u._id)] = u;
  for (const d of deptDocs) deptMap[objId(d._id)] = d;
  for (const f of facDocs)  facMap[objId(f._id)]  = f;
  console.log(`   Found ${appDocs.length} smapplications`);

  const statusMap = s => {
    const l = (s || '').toLowerCase();
    if (l.includes('dapc'))    return 'Department Review';
    if (l.includes('fapsc') || l.includes('fapc')) return 'Faculty Review';
    if (l.includes('uapc'))    return 'UAPC Review';
    if (l.includes('complet')) return 'Council Approved'; // matches AcademicPromotionState.CouncilApproved
    return 'Draft';
  };
  const appStatusMap = (status, appStatus, uapcDone) => {
    const c = ((status || '') + ' ' + (appStatus || '')).toLowerCase();
    if (c.includes('promoted'))               return 'Approved';
    // If UAPC completed their review but system recorded denial, treat as promoted (data quality fix)
    if ((c.includes('denied') || c.includes('not approved')) && uapcDone) return 'Approved';
    if (c.includes('denied') || c.includes('not approved')) return 'Not Approved';
    if (c.includes('returned'))               return 'Returned';
    if (c.includes('pending') || c.includes('submit') || c.includes('review')) return 'Submitted';
    return 'Draft';
  };

  // Pre-upload all files concurrently, then build rows synchronously to keep ID maps consistent
  const fileKeys = await runConcurrent(appDocs.map(doc => async () => {
    const applicantId = objId(doc.staff);
    if (!userMap[applicantId]?._id || excludedUserIds.has(applicantId) || !userIdMap[applicantId]) {
      return [null, null];
    }
    return Promise.all([
      uploadLegacyFile(extractFilename(doc.curriculum_vitae)),
      uploadLegacyFile(extractFilename(doc.application_letter)),
    ]);
  }));

  const rows = [];
  for (let i = 0; i < appDocs.length; i++) {
    const doc = appDocs[i];
    const applicant = userMap[objId(doc.staff)] || {};
    const applicantId = objId(doc.staff);
    if (!applicant._id || excludedUserIds.has(applicantId) || !userIdMap[applicantId]) {
      continue;
    }
    const v1DeptId  = objId(applicant.department);
    const dept      = v1DeptId ? deptMap[v1DeptId] : null;
    const v1FacId   = dept ? objId(dept.faculty) : null;
    const fac       = v1FacId ? facMap[v1FacId] : null;
    if (shouldExcludeText(doc.name, doc.curriculum_vitae, doc.application_letter, doc.status, doc.application_status)) {
      continue;
    }

    const [cvKey, letterKey] = fileKeys[i];
    const reviewSt  = statusMap(doc.status);
    const appSt     = appStatusMap(doc.status, doc.application_status, doc.uapc_status === true);

    const history = [
      doc.hod_status    && 'HoD Review',
      doc.dapc_status   && 'Department Review',
      doc.fapsc_status  && 'Faculty Review',
      doc.uapc_status   && 'UAPC Review',
    ].filter(Boolean).join(',') || null;

    rows.push({
      Id: (() => {
        const v2Id = newGuid();
        applicationIdMap[objId(doc._id)] = v2Id;
        appContextMap[objId(doc._id)] = {
          positionId:  positionIdMap[objId(doc.application)] || '',
          applicantId: userIdMap[objId(doc.staff)] || '',
          deptId:      deptIdMap[v1DeptId] || '',
          facId:       facultyIdMap[v1FacId] || '',
        };
        return v2Id;
      })(),
      PromotionPositionId: positionIdMap[objId(doc.application)] || '',
      PromotionPosition:   positionNameMap[objId(doc.application)] || '',
      ApplicantId:         userIdMap[objId(doc.staff)] || '',
      ApplicantName:       [applicant.firstname, applicant.othername, applicant.lastname].filter(Boolean).join(' '),
      ApplicantEmail:      normalizeEmail(applicant.email) || '',
      ApplicantCurrentPosition: (applicant.position || '').toUpperCase(),
      ApplicantDepartmentId:   deptIdMap[v1DeptId]    || '',
      ApplicantSchoolId:       DEFAULT_SCHOOL_ID,
      ApplicantFacultyId:      facultyIdMap[v1FacId]  || '',
      ApplicantDepartmentName: dept?.name || '',
      ApplicantSchoolName:     DEFAULT_SCHOOL,
      ApplicantFacultyName:    fac?.name  || '',
      IsActive:          appSt !== 'Approved' && appSt !== 'Not Approved',
      SubmissionDate:    formatDate(doc.date_submitted),
      ReviewStatus:      reviewSt,
      ReviewStatusHistory: history,
      ApplicationStatus: appSt,
      PerformanceCriteria: JSON.stringify(positionCriteriaMap[objId(doc.application)] || []),
      CurriculumVitaeFile:       cvKey  || null,
      CurriculumVitaeUploadedAt: cvKey  ? formatDate(doc.date_submitted) : null,
      ApplicationLetterFile:     letterKey || null,
      ApplicationLetterUploadedAt: letterKey ? formatDate(doc.date_submitted) : null,
      CreatedAt: formatDate(doc.createdAt) || new Date().toISOString(), UpdatedAt: formatDate(doc.updatedAt) || null,
      CreatedBy: 'migration', UpdatedBy: null,
    });
  }

  await pgInsert(pgAcad, '"AcademicPromotionApplications"', rows, [
    'Id', 'PromotionPositionId', 'PromotionPosition',
    'ApplicantId', 'ApplicantName', 'ApplicantEmail', 'ApplicantCurrentPosition',
    'ApplicantDepartmentId', 'ApplicantSchoolId', 'ApplicantFacultyId',
    'ApplicantDepartmentName', 'ApplicantSchoolName', 'ApplicantFacultyName',
    'IsActive', 'SubmissionDate', 'ReviewStatus', 'ReviewStatusHistory', 'ApplicationStatus',
    'PerformanceCriteria', 'CurriculumVitaeFile', 'CurriculumVitaeUploadedAt',
    'ApplicationLetterFile', 'ApplicationLetterUploadedAt',
    'CreatedAt', 'UpdatedAt', 'CreatedBy', 'UpdatedBy',
  ]);
  console.log(`   Inserted ${rows.length} applications`);
}

// Map v1 strength strings → v2 PerformanceTypes
function mapStrength(s) {
  switch ((s || '').toUpperCase()) {
    case 'HIGH':      return 'High';
    case 'GOOD':      return 'Good';
    case 'ADEQUATE':  return 'Adequate';
    default:          return 'In Adequate';
  }
}

/** Returns position-specific promotion requirements based on v1 position name.
 * Performance criteria format: each string is "Teaching,Publication,Service" performance levels.
 * Criteria are derived from the official UMaT OSASS promotion guidelines (v1 application descriptions). */
function getPositionRequirements(name) {
  const n = (name || '').toUpperCase().trim();
  if (n === 'PROFESSOR') return {
    criteria: ['High,High,High'],
    previousPosition: 'Associate Professor',
    minYears: 4, minPubs: 10, minRefereed: 6,
  };
  if (n === 'ASSOCIATE PROFESSOR') return {
    criteria: ['High,High,Good', 'High,Good,High', 'Good,High,High'],
    previousPosition: 'Senior Lecturer',
    minYears: 4, minPubs: 6, minRefereed: 5,
  };
  if (n === 'SENIOR LECTURER') return {
    criteria: ['High,High,Adequate', 'High,Adequate,High', 'Adequate,High,High', 'Good,Good,Good'],
    previousPosition: 'Lecturer',
    minYears: 4, minPubs: 4, minRefereed: 3,
  };
  if (n === 'SENIOR RESEARCH FELLOW') return {
    criteria: ['High,High,Adequate', 'High,Adequate,High', 'Adequate,High,High', 'Good,Good,Good'],
    previousPosition: 'Research Fellow',
    minYears: 4, minPubs: 6, minRefereed: 4,
  };
  if (n === 'LECTURER') return {
    criteria: [],
    previousPosition: 'Assistant Lecturer',
    minYears: 4, minPubs: 0, minRefereed: 0,
  };
  if (n === 'RESEARCH FELLOW') return {
    criteria: [],
    previousPosition: 'Technical Instructor',
    minYears: 4, minPubs: 0, minRefereed: 0,
  };
  if (n === 'ASSISTANT LECTURER') return {
    criteria: [],
    previousPosition: null,
    minYears: 3, minPubs: 0, minRefereed: 0,
  };
  return { criteria: [], previousPosition: null, minYears: 0, minPubs: 0, minRefereed: 0 };
}

/** Phase 8: v1 remarks (teaching) → TeachingRecords */
async function phase8_teachingRecords(pgAcad, db) {
  console.log('\n[8] Migrating Teaching Records...');
  const [
    remarks, teachCriterias,
    miniLL, miniAT, miniReg, miniQLM, miniPE, miniCS, miniQEQ, miniPEQ, miniSPW, miniAST,
  ] = await Promise.all([
    db.collection('remarks').find({ promotion_category: 'teaching' }).toArray(),
    db.collection('teachingcriterias').find({}).toArray(),
    db.collection('minilectureloads').find({}).toArray(),
    db.collection('miniadaptingteachings').find({}).toArray(),
    db.collection('miniregularities').find({}).toArray(),
    db.collection('miniqualitylecturematerials').find({}).toArray(),
    db.collection('miniperformanceexams').find({}).toArray(),
    db.collection('minicompletesyllabuses').find({}).toArray(),
    db.collection('miniqualityexamquestions').find({}).toArray(),
    db.collection('minipunctualexamquestions').find({}).toArray(),
    db.collection('minisuperviseprojectworks').find({}).toArray(),
    db.collection('miniassessmentteachings').find({}).toArray(),
  ]);

  // Index teachingcriterias by smapplication _id
  const tcByApp = {};
  for (const tc of teachCriterias) tcByApp[objId(tc._id)] = tc;

  // Index evidence files by smapplication _id per subcategory column
  const evidenceByAppCol = {};
  const subcatMiniMap = [
    ['minilectureloads',           miniLL,   'LectureLoad'],
    ['miniadaptingteachings',      miniAT,   'AbilityToAdaptToTeaching'],
    ['miniregularities',           miniReg,  'RegularityAndPunctuality'],
    ['miniqualitylecturematerials',miniQLM,  'QualityOfLectureMaterial'],
    ['miniperformanceexams',       miniPE,   'PerformanceOfStudentInExam'],
    ['minicompletesyllabuses',     miniCS,   'AbilityToCompleteSyllabus'],
    ['miniqualityexamquestions',   miniQEQ,  'QualityOfExamQuestionAndMarkingScheme'],
    ['minipunctualexamquestions',  miniPEQ,  'PunctualityInSettingExamQuestion'],
    ['minisuperviseprojectworks',  miniSPW,  'SupervisionOfProjectWorkAndThesis'],
    ['miniassessmentteachings',    miniAST,  'StudentReactionToAndAssessmentOfTeaching'],
  ];
  const evidenceUploadTasks = [];
  for (const [, docs, col] of subcatMiniMap) {
    for (const d of docs) {
      const appId = objId(d.main);
      if (!appId) continue;
      for (const field of ['link', 'pages_modified', 'old_link']) {
        if (d[field]) {
          evidenceUploadTasks.push(async () => {
            const key = await uploadLegacyFile(extractFilename(d[field]));
            if (key) {
              if (!evidenceByAppCol[appId]) evidenceByAppCol[appId] = {};
              if (!evidenceByAppCol[appId][col]) evidenceByAppCol[appId][col] = [];
              evidenceByAppCol[appId][col].push(key);
            }
          });
        }
      }
    }
  }
  console.log(`   Uploading ${evidenceUploadTasks.length} evidence files concurrently...`);
  await runConcurrent(evidenceUploadTasks);

  // Group remarks by application_id
  const byApp = {};
  for (const r of remarks) {
    const appId = objId(r.application_id);
    if (!appId) continue;
    if (!byApp[appId]) byApp[appId] = [];
    byApp[appId].push(r);
  }

  const subcatToColumn = {
    'lectureload':           'LectureLoad',
    'adaptingteaching':      'AbilityToAdaptToTeaching',
    'regularity':            'RegularityAndPunctuality',
    'qualitylecturematerial':'QualityOfLectureMaterial',
    'performanceexam':       'PerformanceOfStudentInExam',
    'completesyllabus':      'AbilityToCompleteSyllabus',
    'qualityexamquestion':   'QualityOfExamQuestionAndMarkingScheme',
    'punctualexamquestion':  'PunctualityInSettingExamQuestion',
    'superviseprojectwork':  'SupervisionOfProjectWorkAndThesis',
    'assessmentteaching':    'StudentReactionToAndAssessmentOfTeaching',
  };
  const rankToScore  = { staff: 'ApplicantScore', hod: 'DapcScore',  fapsc: 'FapcScore',  uapc: 'UapcScore'  };
  const rankToRemark = { staff: 'ApplicantRemarks',hod: 'DapcRemarks',fapsc: 'FapcRemarks',uapc: 'UapcRemarks' };

  const appIds = Object.keys(byApp);
  console.log(`   Found teaching remarks for ${appIds.length} applications`);

  const rows = [];
  for (const v1AppId of appIds) {
    const v2AppId = applicationIdMap[v1AppId];
    if (!v2AppId) continue;
    const ctx = appContextMap[v1AppId] || {};
    const appRemarks = byApp[v1AppId];
    const tc = tcByApp[v1AppId] || {};
    const appEvidence = evidenceByAppCol[v1AppId] || {};

    // Build one ScoreAndRemark object per subcategory
    const columns = {};
    for (const r of appRemarks) {
      const col = subcatToColumn[r.promotion_subcategory];
      if (!col) continue;
      if (!columns[col]) {
        columns[col] = {
          Id: newGuid(), ApplicantScore: null, ApplicantRemarks: null,
          DapcScore: null, DapcRemarks: null, FapcScore: null, FapcRemarks: null,
          UapcScore: null, UapcRemarks: null, SupportingEvidence: appEvidence[col] || [],
          CreatedAt: new Date().toISOString(), UpdatedAt: null,
        };
      }
      const sf = rankToScore[r.rank];
      const rf = rankToRemark[r.rank];
      if (sf) columns[col][sf] = r.score ?? null;
      if (rf) columns[col][rf] = r.comment || null;
    }
    // Add evidence even for columns that only have files but no remarks
    for (const [col, files] of Object.entries(appEvidence)) {
      if (!columns[col] && files.length) {
        columns[col] = {
          Id: newGuid(), ApplicantScore: null, ApplicantRemarks: null,
          DapcScore: null, DapcRemarks: null, FapcScore: null, FapcRemarks: null,
          UapcScore: null, UapcRemarks: null, SupportingEvidence: files,
          CreatedAt: new Date().toISOString(), UpdatedAt: null,
        };
      }
    }

    const totalAssessed = Object.keys(columns).length;
    const hasUapc  = appRemarks.some(r => r.rank === 'uapc');
    const hasFapc  = appRemarks.some(r => r.rank === 'fapsc');
    const hasHod   = appRemarks.some(r => r.rank === 'hod');
    const hasStaff = appRemarks.some(r => r.rank === 'staff');
    const status   = hasUapc ? 'UAPC Reviewed' : hasFapc ? 'FAPSC Reviewed' : hasHod ? 'HoD Reviewed' : hasStaff ? 'Submitted' : 'Pending';

    const toJson = col => columns[col] ? JSON.stringify(columns[col]) : null;
    rows.push({
      Id: newGuid(),
      PromotionApplicationId: v2AppId,
      PromotionPositionId: ctx.positionId || '',
      ApplicantId: ctx.applicantId || '',
      ApplicantDepartmentId: ctx.deptId || '',
      ApplicantSchoolId: DEFAULT_SCHOOL_ID,
      ApplicantFacultyId: ctx.facId || '',
      Status: status,
      TotalCategoriesAssessed: totalAssessed,
      LectureLoad:                              toJson('LectureLoad'),
      AbilityToAdaptToTeaching:                 toJson('AbilityToAdaptToTeaching'),
      RegularityAndPunctuality:                 toJson('RegularityAndPunctuality'),
      QualityOfLectureMaterial:                 toJson('QualityOfLectureMaterial'),
      PerformanceOfStudentInExam:               toJson('PerformanceOfStudentInExam'),
      AbilityToCompleteSyllabus:                toJson('AbilityToCompleteSyllabus'),
      QualityOfExamQuestionAndMarkingScheme:    toJson('QualityOfExamQuestionAndMarkingScheme'),
      PunctualityInSettingExamQuestion:         toJson('PunctualityInSettingExamQuestion'),
      SupervisionOfProjectWorkAndThesis:        toJson('SupervisionOfProjectWorkAndThesis'),
      StudentReactionToAndAssessmentOfTeaching: toJson('StudentReactionToAndAssessmentOfTeaching'),
      ApplicantPerformance: mapStrength(tc.strength),
      DapcPerformance:      mapStrength(tc.hod_strength),
      FapcPerformance:      mapStrength(tc.fapsc_strength),
      UapcPerformance:      mapStrength(tc.uapc_strength),
      CreatedAt: new Date().toISOString(), UpdatedAt: null, CreatedBy: 'migration', UpdatedBy: null,
    });
  }

  await pgInsert(pgAcad, '"TeachingRecords"', rows, [
    'Id', 'PromotionApplicationId', 'PromotionPositionId',
    'ApplicantId', 'ApplicantDepartmentId', 'ApplicantSchoolId', 'ApplicantFacultyId',
    'Status', 'TotalCategoriesAssessed',
    'LectureLoad', 'AbilityToAdaptToTeaching', 'RegularityAndPunctuality',
    'QualityOfLectureMaterial', 'PerformanceOfStudentInExam', 'AbilityToCompleteSyllabus',
    'QualityOfExamQuestionAndMarkingScheme', 'PunctualityInSettingExamQuestion',
    'SupervisionOfProjectWorkAndThesis', 'StudentReactionToAndAssessmentOfTeaching',
    'ApplicantPerformance', 'DapcPerformance', 'FapcPerformance', 'UapcPerformance',
    'CreatedAt', 'UpdatedAt', 'CreatedBy', 'UpdatedBy',
  ]);
  console.log(`   Inserted ${rows.length} teaching records`);
}

/** Phase 9: v1 minipublications → Publications */
async function phase9_publications(pgAcad, db) {
  console.log('\n[9] Migrating Publications...');
  const [miniPubs, pubRemarks] = await Promise.all([
    db.collection('minipublications').find({}).toArray(),
    db.collection('publicationremarks').find({}).toArray(),
  ]);

  // Index publicationremarks by the minipublication _id they belong to
  const remarkByPub = {};
  for (const r of pubRemarks) {
    const pubId = objId(r.publication);
    if (pubId) remarkByPub[pubId] = r;
  }

  // Group minipublications by smapplication _id
  const byApp = {};
  for (const mp of miniPubs) {
    const appId = objId(mp.main);
    if (!appId) continue;
    if (!byApp[appId]) byApp[appId] = [];
    byApp[appId].push(mp);
  }

  const appIds = Object.keys(byApp);
  console.log(`   Found publications for ${appIds.length} applications`);

  // Also load knowledgecriterias for performance ratings
  const knowledgeCriterias = await db.collection('knowledgecriterias').find({}).toArray();
  const kcByApp = {};
  for (const kc of knowledgeCriterias) kcByApp[objId(kc._id)] = kc;

  const allPubRows = await runConcurrent(appIds.map(v1AppId => async () => {
    const v2AppId = applicationIdMap[v1AppId];
    if (!v2AppId) return null;
    const ctx = appContextMap[v1AppId] || {};
    const kc = kcByApp[v1AppId] || {};

    const pubList = await Promise.all((byApp[v1AppId] || []).map(async mp => {
      const r = remarkByPub[objId(mp._id)] || {};
      const [presentKey, supportKey] = await Promise.all([
        mp.present_link ? uploadLegacyFile(extractFilename(mp.present_link)) : Promise.resolve(null),
        mp.link ? uploadLegacyFile(extractFilename(mp.link)) : Promise.resolve(null),
      ]);
      return {
        Id: newGuid(),
        Title: mp.title || '',
        Year: 0,
        SystemGeneratedScore: 0,
        PublicationTypeId: '',
        PublicationTypeName: mp.publication_category || '',
        IsPresented: mp.presentation === true || r.present === 1,
        PresentationBonus: 0,
        PresentationEvidence: presentKey ? [presentKey] : [],
        ApplicantScore:  r.applicant_score  ?? null,
        ApplicantRemarks: r.applicant_comment || null,
        DapcScore:  r.hod_score   ?? null,
        DapcRemarks: r.hod_comment  || null,
        FapcScore:  r.fapsc_score  ?? null,
        FapcRemarks: r.fapsc_comment || null,
        UapcScore:  r.uapc_score   ?? null,
        UapcRemarks: r.uapc_comment  || null,
        SupportingEvidence: supportKey ? [supportKey] : [],
        CreatedAt: new Date().toISOString(), UpdatedAt: null,
      };
    }));

    return {
      Id: newGuid(),
      PromotionApplicationId: v2AppId,
      PromotionPositionId: ctx.positionId || '',
      ApplicantId: ctx.applicantId || '',
      ApplicantDepartmentId: ctx.deptId || '',
      ApplicantSchoolId: DEFAULT_SCHOOL_ID,
      ApplicantFacultyId: ctx.facId || '',
      Status: 'Submitted',
      Publications: JSON.stringify(pubList),
      ApplicantPerformance: mapStrength(kc.strength),
      DapcPerformance:      mapStrength(kc.hod_strength),
      FapcPerformance:      mapStrength(kc.fapsc_strength),
      UapcPerformance:      mapStrength(kc.uapc_strength),
      CreatedAt: new Date().toISOString(), UpdatedAt: null, CreatedBy: 'migration', UpdatedBy: null,
    };
  }));
  const rows = allPubRows.filter(Boolean);

  await pgInsert(pgAcad, '"Publications"', rows, [
    'Id', 'PromotionApplicationId', 'PromotionPositionId',
    'ApplicantId', 'ApplicantDepartmentId', 'ApplicantSchoolId', 'ApplicantFacultyId',
    'Status', 'Publications',
    'ApplicantPerformance', 'DapcPerformance', 'FapcPerformance', 'UapcPerformance',
    'CreatedAt', 'UpdatedAt', 'CreatedBy', 'UpdatedBy',
  ]);
  console.log(`   Inserted ${rows.length} publication records`);
}

/** Phase 10: v1 service collections → ServiceRecords */
async function phase10_serviceRecords(pgAcad, db) {
  console.log('\n[10] Migrating Service Records...');
  const [
    adminExp, adhocComm, statComm, otherExp,
    intlComm, natComm,
    adminRemarks, adhocRemarks, statRemarks, otherRemarks, intlRemarks, natRemarks,
    serviceCriterias,
  ] = await Promise.all([
    db.collection('miniadministrativeexperiences').find({}).toArray(),
    db.collection('miniadhoccommittees').find({}).toArray(),
    db.collection('ministatutorycommittees').find({}).toArray(),
    db.collection('miniotherexperiences').find({}).toArray(),
    db.collection('miniinternationalcommittees').find({}).toArray(),
    db.collection('mininationalcommittees').find({}).toArray(),
    db.collection('administrativeexperienceremarks').find({}).toArray(),
    db.collection('adhoccommitteeremarks').find({}).toArray(),
    db.collection('statutorycommitteeremarks').find({}).toArray(),
    db.collection('otherexperienceremarks').find({}).toArray(),
    db.collection('internationalcommitteeremarks').find({}).toArray(),
    db.collection('nationalcommitteeremarks').find({}).toArray(),
    db.collection('servicecriterias').find({}).toArray(),
  ]);

  // Index each remark collection by its linking foreign-key field
  const buildRemarkMap = (docs, fkField) => {
    const map = {};
    for (const r of docs) { const k = objId(r[fkField]); if (k) map[k] = r; }
    return map;
  };
  const adminRemMap  = buildRemarkMap(adminRemarks,  'administrativeexperience');
  const adhocRemMap  = buildRemarkMap(adhocRemarks,  'adhoccommittee');
  const statRemMap   = buildRemarkMap(statRemarks,   'statutorycommittee');
  const otherRemMap  = buildRemarkMap(otherRemarks,  'otherexperience');
  const intlRemMap   = buildRemarkMap(intlRemarks,   'internationalcommittee');
  const natRemMap    = buildRemarkMap(natRemarks,    'nationalcommittee');

  // Index servicecriterias by smapplication _id
  const scByApp = {};
  for (const sc of serviceCriterias) scByApp[objId(sc._id)] = sc;

  // Group by main (smapplication _id)
  const uniByApp = {}, natByApp = {};
  // University service: administrative + adhoc + statutory + other experiences
  for (const d of [...adminExp, ...adhocComm, ...statComm, ...otherExp]) {
    const id = objId(d.main); if (!id) continue;
    if (!uniByApp[id]) uniByApp[id] = [];
    uniByApp[id].push(d);
  }
  // National/International service
  for (const d of [...intlComm, ...natComm]) {
    const id = objId(d.main); if (!id) continue;
    if (!natByApp[id]) natByApp[id] = [];
    natByApp[id].push(d);
  }

  const allAppIds = new Set([...Object.keys(uniByApp), ...Object.keys(natByApp)]);
  console.log(`   Found service records for ${allAppIds.size} applications`);

  // Pick the remark for a mini-doc by trying each map in order (each FK is unique across maps)
  const getRemarkForDoc = d => {
    const id = objId(d._id);
    if (d.position !== undefined) return adminRemMap[id] || {};  // miniadministrativeexperiences
    if (d.committee !== undefined) {
      // adhoc, statutory, or international committees — disambiguate by map lookup
      if (adhocRemMap[id])  return adhocRemMap[id];
      if (statRemMap[id])   return statRemMap[id];
      return intlRemMap[id] || {};
    }
    // title_of_service — could be national committee OR other experience
    if (natRemMap[id])   return natRemMap[id];
    return otherRemMap[id] || {};
  };

  const toServiceItem = async d => {
    const r = getRemarkForDoc(d);
    const supportKey = d.link ? await uploadLegacyFile(extractFilename(d.link)) : null;
    return {
      Id: newGuid(),
      ServiceTitle: d.position || d.committee || d.title_of_service || '',
      Role: d.designation || d.role || d.category || null,
      Duration: [d.from, d.to].filter(Boolean).join(' - ') || null,
      ServiceTypeId: null, SystemGeneratedScore: null, IsActing: false,
      ApplicantScore:  r.applicant_score  ?? null,
      ApplicantRemarks: r.applicant_comment || null,
      DapcScore:  r.hod_score   ?? null,
      DapcRemarks: r.hod_comment  || null,
      FapcScore:  r.fapsc_score  ?? null,
      FapcRemarks: r.fapsc_comment || null,
      UapcScore:  r.uapc_score   ?? null,
      UapcRemarks: r.uapc_comment  || null,
      SupportingEvidence: supportKey ? [supportKey] : [],
      CreatedAt: new Date().toISOString(), UpdatedAt: null,
    };
  };

  const allSvcRows = await runConcurrent([...allAppIds].map(v1AppId => async () => {
    const v2AppId = applicationIdMap[v1AppId];
    if (!v2AppId) return null;
    const ctx = appContextMap[v1AppId] || {};

    const [uniItems, natItems] = await Promise.all([
      Promise.all((uniByApp[v1AppId] || []).map(toServiceItem)),
      Promise.all((natByApp[v1AppId] || []).map(toServiceItem)),
    ]);

    return {
      Id: newGuid(),
      PromotionApplicationId: v2AppId,
      PromotionPositionId: ctx.positionId || '',
      ApplicantId: ctx.applicantId || '',
      ApplicantDepartmentId: ctx.deptId || '',
      ApplicantSchoolId: DEFAULT_SCHOOL_ID,
      ApplicantFacultyId: ctx.facId || '',
      Status: 'Submitted',
      ServiceToTheUniversity:            JSON.stringify(uniItems),
      ServiceToNationalAndInternational: JSON.stringify(natItems),
      ApplicantPerformance: mapStrength((scByApp[v1AppId] || {}).strength),
      DapcPerformance:      mapStrength((scByApp[v1AppId] || {}).hod_strength),
      FapcPerformance:      mapStrength((scByApp[v1AppId] || {}).fapsc_strength),
      UapcPerformance:      mapStrength((scByApp[v1AppId] || {}).uapc_strength),
      CreatedAt: new Date().toISOString(), UpdatedAt: null, CreatedBy: 'migration', UpdatedBy: null,
    };
  }));
  const rows = allSvcRows.filter(Boolean);

  await pgInsert(pgAcad, '"ServiceRecords"', rows, [
    'Id', 'PromotionApplicationId', 'PromotionPositionId',
    'ApplicantId', 'ApplicantDepartmentId', 'ApplicantSchoolId', 'ApplicantFacultyId',
    'Status', 'ServiceToTheUniversity', 'ServiceToNationalAndInternational',
    'ApplicantPerformance', 'DapcPerformance', 'FapcPerformance', 'UapcPerformance',
    'CreatedAt', 'UpdatedAt', 'CreatedBy', 'UpdatedBy',
  ]);
  console.log(`   Inserted ${rows.length} service records`);
}

// ─── Main \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500


/** Phase 11: v1 service lookup collections → ServicePositions */
async function phase11_servicePositions(pgId, db) {
  console.log('\n[11] Migrating Service Positions...');
  const [positions, roles, categorytypes, nationalinterroles, otherroles] = await Promise.all([
    db.collection('positions').find({}).toArray(),
    db.collection('roles').find({}).toArray(),
    db.collection('categorytypes').find({}).toArray(),
    db.collection('nationalinterroles').find({}).toArray(),
    db.collection('otherroles').find({}).toArray(),
  ]);

  const toRows = (docs, serviceType) => docs.map(d => ({
    Id: newGuid(),
    Name: d.name || '',
    Score: Number(d.score) || 0,
    ServiceType: serviceType,
    CreatedAt: new Date().toISOString(), UpdatedAt: null, CreatedBy: 'migration', UpdatedBy: null,
  }));

  const rows = [
    ...toRows(positions,         'Administrative Experience'),
    ...toRows(roles,             'Non-statutory Committee'),
    ...toRows(categorytypes,     'Statutory Committee'),
    ...toRows(nationalinterroles,'National & International Committee'),
    ...toRows(otherroles,        'Other Experience'),
  ];

  await pgInsert(pgId, '"ServicePositions"', rows, [
    'Id', 'Name', 'Score', 'ServiceType', 'CreatedAt', 'UpdatedAt', 'CreatedBy', 'UpdatedBy',
  ]);
  console.log(`   Inserted ${rows.length} service positions`);
}

/** Phase 12: v1 categories → PublicationIndicators */
async function phase12_publicationIndicators(pgId, db) {
  console.log('\n[12] Migrating Publication Indicators...');
  const cats = await db.collection('categories').find({}).toArray();

  const rows = cats.map(d => ({
    Id: newGuid(),
    Name: d.name || '',
    Score: Number(d.score) || 0,
    ScoreForPresentation: 0,
    CreatedAt: new Date().toISOString(), UpdatedAt: null, CreatedBy: 'migration', UpdatedBy: null,
  }));

  await pgInsert(pgId, '"PublicationIndicators"', rows, [
    'Id', 'Name', 'Score', 'ScoreForPresentation', 'CreatedAt', 'UpdatedAt', 'CreatedBy', 'UpdatedBy',
  ]);
  console.log(`   Inserted ${rows.length} publication indicators`);
}

/** Phase 13: Close UAPC-reviewed applications where UAPC has actually scored all 3 categories.
 * Matches the v2 backend logic exactly:
 *   - Only close if UapcPerformance is non-default in ALL THREE categories (teaching, publication, service)
 *   - Uses sorted rank comparison (category-agnostic), matching MatchesPerformanceCriteria in AssessmentService.cs
 *   - Approved → ReviewStatus="Council Approved", ApplicationStatus="Approved", IsActive=false
 *   - Not Approved → ReviewStatus="Council Approved", ApplicationStatus="Not Approved", IsActive=false
 *   - No UAPC scores → leave at current ReviewStatus/ApplicationStatus (pending for UAPC to score) */
async function phase13_closeCompletedPromotions(pgAcad) {
  console.log('\n[13] Closing completed UAPC-reviewed promotions...');

  const result = await pgAcad.query(`
    SELECT
      a."Id" AS app_id,
      p."PerformanceCriteria" AS position_criteria,
      t."Id" AS teaching_id, t."UapcPerformance" AS teaching_uapc,
      pub."Id" AS pub_id, pub."UapcPerformance" AS pub_uapc,
      s."Id" AS svc_id, s."UapcPerformance" AS svc_uapc
    FROM "AcademicPromotionApplications" a
    LEFT JOIN "AcademicPromotionPositions" p ON p."Id" = a."PromotionPositionId"
    LEFT JOIN "TeachingRecords" t ON t."PromotionApplicationId" = a."Id"
    LEFT JOIN "Publications" pub ON pub."PromotionApplicationId" = a."Id"
    LEFT JOIN "ServiceRecords" s ON s."PromotionApplicationId" = a."Id"
    WHERE a."ReviewStatus" = 'UAPC Review'
      AND a."ApplicationStatus" = 'Submitted'
  `);

  console.log(`   Found ${result.rows.length} UAPC Review applications to evaluate`);

  // Performance level map matching PerformanceTypes in v2 EnumTypes.cs
  const PERF_LEVEL = { 'In Adequate': 1, 'Adequate': 2, 'Good': 3, 'High': 4 };
  const DEFAULT_PERF = 'In Adequate';

  // Replicates MatchesPerformanceCriteria from AssessmentService.cs:
  // Sorts both actual and required ranks descending, then checks each required rank
  // is satisfied by the corresponding actual rank (greedy match on sorted arrays).
  function meetsCriteria(teachingPerf, pubPerf, svcPerf, criteriaList) {
    if (!criteriaList || criteriaList.length === 0) return true; // no criteria = any performance passes
    const actualRanks = [PERF_LEVEL[teachingPerf] || 0, PERF_LEVEL[pubPerf] || 0, PERF_LEVEL[svcPerf] || 0]
      .sort((a, b) => b - a);
    return criteriaList.some(criterion => {
      const parts = criterion.split(',').map(p => p.trim());
      if (parts.length !== 3) return false;
      const requiredRanks = parts.map(p => PERF_LEVEL[p] || 0).sort((a, b) => b - a);
      const used = [false, false, false];
      for (let j = 0; j < 3; j++) {
        let matched = false;
        for (let k = 0; k < 3; k++) {
          if (!used[k] && actualRanks[k] >= requiredRanks[j]) {
            used[k] = true;
            matched = true;
            break;
          }
        }
        if (!matched) return false;
      }
      return true;
    });
  }

  let closedApproved = 0, closedDenied = 0, skipped = 0;
  const now = new Date().toISOString();

  for (const row of result.rows) {
    const teachingPerf = row.teaching_uapc;
    const pubPerf = row.pub_uapc;
    const svcPerf = row.svc_uapc;

    // Only close if UAPC has actually scored all 3 categories (none are the default "In Adequate")
    // If any category is unscored (null or default), the application stays pending for UAPC to complete
    if (!teachingPerf || !pubPerf || !svcPerf ||
        teachingPerf === DEFAULT_PERF || pubPerf === DEFAULT_PERF || svcPerf === DEFAULT_PERF) {
      skipped++;
      continue;
    }

    const criteria = Array.isArray(row.position_criteria) ? row.position_criteria : [];
    const passes = meetsCriteria(teachingPerf, pubPerf, svcPerf, criteria);
    const newAppStatus = passes ? 'Approved' : 'Not Approved';

    // Use "Council Approved" — matches AcademicPromotionState.CouncilApproved in v2 ApproveApplication
    await pgAcad.query(`
      UPDATE "AcademicPromotionApplications"
      SET "ApplicationStatus" = $1, "ReviewStatus" = 'Council Approved',
          "IsActive" = false, "UpdatedAt" = $2, "UpdatedBy" = 'migration'
      WHERE "Id" = $3
    `, [newAppStatus, now, row.app_id]);

    if (passes) closedApproved++;
    else closedDenied++;
  }

  console.log(`   Closed: ${closedApproved} approved, ${closedDenied} not approved`);
  console.log(`   Kept pending (no UAPC scores): ${skipped}`);
}

/** Phase 0: Truncate all migrated tables so the script is idempotent */
async function phase0_clearDatabases(pgId, pgAcad) {
  console.log('\n[0] Clearing databases...');
  if (DRY_RUN) {
    console.log('  [dry-run] Would TRUNCATE all tables');
    return;
  }
  // Identity tables — children before parents
  const identityTables = [
    '"StaffUpdates"', '"AuditLogs"', '"Staffs"',
    '"Departments"', '"Faculties"', '"Schools"',
    '"ServicePositions"', '"PublicationIndicators"', '"KnowledgeMaterialIndicators"',
  ];
  // Academic tables — leaf tables first
  const academicTables = [
    '"AssessmentActivities"',
    '"TeachingRecords"', '"Publications"', '"ServiceRecords"',
    '"AcademicPromotionApplications"',
    '"AcademicPromotionCommittees"', '"AcademicPromotionPositions"',
  ];
  for (const t of identityTables) {
    await pgId.query(`TRUNCATE TABLE ${t} CASCADE`);
  }
  for (const t of academicTables) {
    await pgAcad.query(`TRUNCATE TABLE ${t} CASCADE`);
  }
  console.log('  Cleared all tables.');
}

async function main() {
  assertEnv();
  console.log('\nOSASS v1 \u2192 v2 Migration');
  console.log(`  Mongo:    ${MONGO_URI}`);
  console.log(`  Identity: ${PG_IDENTITY.replace(/:[^:@]+@/, ':***@')}`);
  console.log(`  Academic: ${PG_ACADEMIC.replace(/:[^:@]+@/, ':***@')}`);
  console.log(`  DRY_RUN:  ${DRY_RUN}\n`);

  const mongo = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  await mongo.connect();
  const dbName = MONGO_URI.split('/').pop().split('?')[0] || 'LiveOsassDB';
  const db = mongo.db(dbName);
  console.log(`Connected to MongoDB: ${dbName}`);

  const pgId   = new Client({ connectionString: PG_IDENTITY });
  const pgAcad = new Client({ connectionString: PG_ACADEMIC });
  await pgId.connect();
  console.log('Connected to PostgreSQL (Identity).');
  await pgAcad.connect();
  console.log('Connected to PostgreSQL (Academic).');

  try {
    await phase0_clearDatabases(pgId, pgAcad);
    await phase1_school(pgId);
    await phase2_faculties(pgId, db);
    const deptToFaculty = await phase3_departments(pgId, db);
    const committeeUsers = await phase4_users(pgId, db, deptToFaculty);
    await phase5_committees(pgAcad, committeeUsers);
    await phase6_positions(pgAcad, db);
    await phase7_applications(pgAcad, db);    await phase8_teachingRecords(pgAcad, db);
    await phase9_publications(pgAcad, db);
    await phase10_serviceRecords(pgAcad, db);
    await phase11_servicePositions(pgId, db);
    await phase12_publicationIndicators(pgId, db);
    await phase13_closeCompletedPromotions(pgAcad);
    printUploadSummary();
    console.log('\n\u2713 Migration complete.');
  } finally {
    await pgId.end();
    await pgAcad.end();
    await mongo.close();
  }
}

main().catch(err => { console.error('Migration failed:', err); process.exit(1); });
