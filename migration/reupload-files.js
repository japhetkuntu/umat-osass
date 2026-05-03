#!/usr/bin/env node
/**
 * Standalone re-uploader for failed migration files.
 *
 * Usage:
 *   node reupload-files.js <filename1> [filename2] ...
 *
 * Example:
 *   node reupload-files.js \
 *     "1724272811419--teaching-criteria-adapting-teaching.pdf" \
 *     "1661172255709--knowledge-criteria-publications.pdf"
 *
 * All config (OLD_FILES_ROOT, MINIO_*) is read from the same .env file
 * used by the main migration script.
 */
'use strict';
const fs   = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const env = process.env;

const OLD_FILES_ROOT = env.OLD_FILES_ROOT || '';
const S3_ENDPOINT    = env.MINIO_ENDPOINT    || '';
const S3_KEY         = env.MINIO_ACCESS_KEY  || '';
const S3_SECRET      = env.MINIO_SECRET_KEY  || '';
const S3_BUCKET      = env.MINIO_BUCKET      || 'osass';
const S3_FOLDER      = env.MINIO_FOLDER      || 'legacy';
const UPLOAD_RETRIES = env.UPLOAD_RETRIES ? parseInt(env.UPLOAD_RETRIES, 10) : 3;
const CONCURRENCY    = env.CONCURRENCY    ? parseInt(env.CONCURRENCY,    10) : 10;

// ─── Helpers ────────────────────────────────────────────────────────────────────

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

async function runConcurrent(tasks, limit = CONCURRENCY) {
  const results = [];
  for (let i = 0; i < tasks.length; i += limit) {
    const batch = await Promise.all(tasks.slice(i, i + limit).map(fn => fn()));
    results.push(...batch);
  }
  return results;
}

// ─── Upload ──────────────────────────────────────────────────────────────────────

let _s3Client = null;

async function uploadFile(filename) {
  if (!OLD_FILES_ROOT) {
    console.error('ERROR: OLD_FILES_ROOT is not set in .env');
    return { filename, ok: false, reason: 'OLD_FILES_ROOT not configured' };
  }
  if (!S3_ENDPOINT || !S3_KEY || !S3_SECRET) {
    console.error('ERROR: MINIO_ENDPOINT / MINIO_ACCESS_KEY / MINIO_SECRET_KEY not set in .env');
    return { filename, ok: false, reason: 'S3 config missing' };
  }

  const localPath = path.join(OLD_FILES_ROOT, filename);
  if (!fs.existsSync(localPath)) {
    console.warn(`  [skip] Local file not found: ${localPath}`);
    return { filename, ok: false, reason: 'Local file not found' };
  }

  const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
  if (!_s3Client) {
    _s3Client = new S3Client({
      endpoint: S3_ENDPOINT,
      region: 'us-east-1',
      credentials: { accessKeyId: S3_KEY, secretAccessKey: S3_SECRET },
      forcePathStyle: true,
    });
  }

  const objectKey  = `${S3_FOLDER}/${filename}`;
  const ext        = path.extname(filename).toLowerCase();
  const contentType = { '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg' }[ext] || 'application/octet-stream';

  try {
    await withRetry(() => _s3Client.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: objectKey,
      Body: fs.createReadStream(localPath),
      ContentType: contentType,
      ACL: 'public-read',
    })));
    console.log(`  [ok] ${filename} → ${objectKey}`);
    return { filename, ok: true };
  } catch (e) {
    console.warn(`  [fail] ${filename}: ${e.message}`);
    return { filename, ok: false, reason: e.message };
  }
}

// ─── Entry point ─────────────────────────────────────────────────────────────────

async function main() {
  const filenames = process.argv.slice(2).filter(Boolean);
  if (!filenames.length) {
    console.error('Usage: node reupload-files.js <filename1> [filename2] ...');
    process.exit(1);
  }

  console.log(`Re-uploading ${filenames.length} file(s) with up to ${UPLOAD_RETRIES} retries each (${CONCURRENCY} at a time)...\n`);

  const results = await runConcurrent(filenames.map(f => () => uploadFile(f)), CONCURRENCY);

  const succeeded = results.filter(r => r.ok);
  const failed    = results.filter(r => !r.ok);

  console.log(`\n─── Summary ─────────────────────────────────`);
  console.log(`  Succeeded : ${succeeded.length}`);
  console.log(`  Failed    : ${failed.length}`);
  if (failed.length) {
    console.log('  Failures:');
    for (const f of failed) {
      console.log(`    - ${f.filename}: ${f.reason}`);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
