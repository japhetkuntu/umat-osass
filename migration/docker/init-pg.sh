#!/usr/bin/env bash
# Runs inside the migration-postgres container on first start.
# Creates the three v2 databases and applies the EF Core migration schemas.
set -e

PSQL="psql -v ON_ERROR_STOP=1 --username=$POSTGRES_USER"

echo "==> Creating databases..."
for db in OsassIdentityDb AcademicPromotionDb NonAcademicPromotionDb; do
  $PSQL --dbname="$POSTGRES_DB" -c "SELECT 1 FROM pg_database WHERE datname = '${db}'" \
    | grep -q 1 || $PSQL --dbname="$POSTGRES_DB" -c "CREATE DATABASE \"${db}\";"
done

echo "==> Applying Identity schema to OsassIdentityDb..."
$PSQL --dbname="OsassIdentityDb" -f /docker-entrypoint-initdb.d/identity-schema.sql

echo "==> Applying Academic schema to AcademicPromotionDb..."
$PSQL --dbname="AcademicPromotionDb" -f /docker-entrypoint-initdb.d/academic-schema.sql

echo "==> Applying NonAcademic schema to NonAcademicPromotionDb..."
$PSQL --dbname="NonAcademicPromotionDb" -f /docker-entrypoint-initdb.d/nonacademic-schema.sql

echo "==> All schemas applied."
