DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'identity') THEN
        CREATE SCHEMA identity;
    END IF;
END $EF$;
CREATE TABLE IF NOT EXISTS identity."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260118132033_Initial') THEN
    CREATE TABLE "Admins" (
        "Id" text NOT NULL,
        "FirstName" text NOT NULL,
        "LastName" text NOT NULL,
        "Email" text NOT NULL,
        "Password" text NOT NULL,
        "Role" text NOT NULL,
        "LastLoginAt" timestamp with time zone,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "CreatedBy" text NOT NULL,
        "UpdatedBy" text,
        CONSTRAINT "PK_Admins" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260118132033_Initial') THEN
    CREATE TABLE "Departments" (
        "Id" text NOT NULL,
        "Name" text NOT NULL,
        "SchoolId" text NOT NULL,
        "FacultyId" text,
        "DepartmentType" text NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "CreatedBy" text NOT NULL,
        "UpdatedBy" text,
        CONSTRAINT "PK_Departments" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260118132033_Initial') THEN
    CREATE TABLE "Faculties" (
        "Id" text NOT NULL,
        "Name" text NOT NULL,
        "SchoolId" text NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "CreatedBy" text NOT NULL,
        "UpdatedBy" text,
        CONSTRAINT "PK_Faculties" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260118132033_Initial') THEN
    CREATE TABLE "Schools" (
        "Id" text NOT NULL,
        "Name" text NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "CreatedBy" text NOT NULL,
        "UpdatedBy" text,
        CONSTRAINT "PK_Schools" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260118132033_Initial') THEN
    CREATE TABLE "Staffs" (
        "Id" text NOT NULL,
        "Email" text NOT NULL,
        "FirstName" text NOT NULL,
        "LastName" text NOT NULL,
        "StaffId" text NOT NULL,
        "Rank" text NOT NULL,
        "Title" text NOT NULL,
        "StaffCategory" text NOT NULL,
        "UniversityRole" text,
        "Password" text NOT NULL,
        "LastLoginAt" timestamp with time zone,
        "DepartmentId" text,
        "FacultyId" text,
        "SchoolIds" text,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "CreatedBy" text NOT NULL,
        "UpdatedBy" text,
        CONSTRAINT "PK_Staffs" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260118132033_Initial') THEN
    INSERT INTO identity."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260118132033_Initial', '8.0.0');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260120172916_added_service_position') THEN
    CREATE TABLE "ServicePositions" (
        "Id" text NOT NULL,
        "Name" text NOT NULL,
        "Score" double precision NOT NULL,
        "ServiceType" text NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "CreatedBy" text NOT NULL,
        "UpdatedBy" text,
        CONSTRAINT "PK_ServicePositions" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260120172916_added_service_position') THEN
    INSERT INTO identity."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260120172916_added_service_position', '8.0.0');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260120174100_added_publication_identity') THEN
    CREATE TABLE "PublicationIndicators" (
        "Id" text NOT NULL,
        "Name" text NOT NULL,
        "Score" double precision NOT NULL,
        "ScoreForPresentation" double precision NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "CreatedBy" text NOT NULL,
        "UpdatedBy" text,
        CONSTRAINT "PK_PublicationIndicators" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260120174100_added_publication_identity') THEN
    INSERT INTO identity."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260120174100_added_publication_identity', '8.0.0');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260120201938_added_audit_logs') THEN
    CREATE TABLE "AuditLogs" (
        "Id" text NOT NULL,
        "Platform" text NOT NULL,
        "Action" text NOT NULL,
        "PerformedByUserId" text NOT NULL,
        "Metadata" text,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "CreatedBy" text NOT NULL,
        "UpdatedBy" text,
        CONSTRAINT "PK_AuditLogs" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260120201938_added_audit_logs') THEN
    INSERT INTO identity."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260120201938_added_audit_logs', '8.0.0');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260220150029_added_additional_property_to_staff') THEN
    ALTER TABLE "Staffs" DROP COLUMN "SchoolIds";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260220150029_added_additional_property_to_staff') THEN
    ALTER TABLE "Staffs" RENAME COLUMN "Rank" TO "SchoolId";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260220150029_added_additional_property_to_staff') THEN
    UPDATE "Staffs" SET "FacultyId" = '' WHERE "FacultyId" IS NULL;
    ALTER TABLE "Staffs" ALTER COLUMN "FacultyId" SET NOT NULL;
    ALTER TABLE "Staffs" ALTER COLUMN "FacultyId" SET DEFAULT '';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260220150029_added_additional_property_to_staff') THEN
    UPDATE "Staffs" SET "DepartmentId" = '' WHERE "DepartmentId" IS NULL;
    ALTER TABLE "Staffs" ALTER COLUMN "DepartmentId" SET NOT NULL;
    ALTER TABLE "Staffs" ALTER COLUMN "DepartmentId" SET DEFAULT '';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260220150029_added_additional_property_to_staff') THEN
    ALTER TABLE "Staffs" ADD "LastAppointmentOrPromotionDate" timestamp with time zone NOT NULL DEFAULT TIMESTAMPTZ '-infinity';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260220150029_added_additional_property_to_staff') THEN
    ALTER TABLE "Staffs" ADD "Position" text NOT NULL DEFAULT '';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260220150029_added_additional_property_to_staff') THEN
    ALTER TABLE "Staffs" ADD "PreviousPosition" text NOT NULL DEFAULT '';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260220150029_added_additional_property_to_staff') THEN
    INSERT INTO identity."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260220150029_added_additional_property_to_staff', '8.0.0');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260311100119_added_staff_update') THEN
    CREATE TABLE "StaffUpdates" (
        "Id" text NOT NULL,
        "Title" text NOT NULL,
        "Content" text NOT NULL,
        "Category" text NOT NULL,
        "Priority" text NOT NULL,
        "IsVisible" boolean NOT NULL,
        "PublishedAt" timestamp with time zone,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "CreatedBy" text NOT NULL,
        "UpdatedBy" text,
        CONSTRAINT "PK_StaffUpdates" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260311100119_added_staff_update') THEN
    INSERT INTO identity."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260311100119_added_staff_update', '8.0.0');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260314160703_make_staff_faculty_id_nullable') THEN
    ALTER TABLE "Staffs" ALTER COLUMN "FacultyId" DROP NOT NULL;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260314160703_make_staff_faculty_id_nullable') THEN
    INSERT INTO identity."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260314160703_make_staff_faculty_id_nullable', '8.0.0');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260314201828_AddKnowledgeMaterialIndicator') THEN
    CREATE TABLE "KnowledgeMaterialIndicators" (
        "Id" text NOT NULL,
        "Name" text NOT NULL,
        "Score" double precision NOT NULL,
        "ScoreForPresentation" double precision NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "CreatedBy" text NOT NULL,
        "UpdatedBy" text,
        CONSTRAINT "PK_KnowledgeMaterialIndicators" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM identity."__EFMigrationsHistory" WHERE "MigrationId" = '20260314201828_AddKnowledgeMaterialIndicator') THEN
    INSERT INTO identity."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260314201828_AddKnowledgeMaterialIndicator', '8.0.0');
    END IF;
END $EF$;
COMMIT;

