# OSASS v1 → v2 Migration Helper

This folder contains helper scripts to inspect a MongoDB dump from the legacy OSASS v1 app and migrate core data into the v2 PostgreSQL schema.

## Setup

1. Install dependencies:

```bash
cd /Users/joe/Work/Others/UMaT/OsassServices/migration
npm install
```

2. Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

- `MONGO_DUMP_DIR` should point to `~/Downloads/v1-backup/mongo-dump/LiveOsassDB`
- `PG_CONNECTION_STRING` should point to your v2 PostgreSQL database
- `OLD_FILES_ROOT` should point to the extracted legacy upload folder
- `MINIO_*` values should point to your v2 MinIO endpoint and credentials

## Inspect the Mongo dump

Use this first to discover collection names and sample documents:

```bash
npm run inspect -- /Users/joe/Downloads/v1-backup/mongo-dump/LiveOsassDB
```

That will print the collection list and the first 3 documents from each `.bson` file.

## Run the migration

Once `.env` is configured, run:

```bash
npm run migrate
```

The script currently supports these collection names by default:
- `users`
- `admins`
- `academicApplications`
- `nonAcademicApplications`
- `academicCommittees`
- `nonAcademicCommittees`

If your legacy collection names differ, set them in `.env`.

## Notes

- The script inserts into v2 tables using the current OSASS schema names: `Staffs`, `Admins`, `AcademicPromotionApplications`, `NonAcademicPromotionApplications`, `AcademicPromotionCommittees`, `NonAcademicPromotionCommittees`.
- It preserves legacy document IDs as string GUIDs where possible and skips duplicate `Id` values.
- Uploaded files are copied from the legacy `OLD_FILES_ROOT` path into MinIO and made public.
- The mapping is intentionally heuristic; inspect the sample documents and adjust the field names in `migrate-v1-to-v2.js` if your v1 data uses different key names.
