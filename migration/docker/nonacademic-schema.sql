DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'nonAcademicPromotion') THEN
        CREATE SCHEMA "nonAcademicPromotion";
    END IF;
END $EF$;
CREATE TABLE IF NOT EXISTS "nonAcademicPromotion"."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE TABLE "KnowledgeProfessionRecords" (
        "Id" text NOT NULL,
        "PromotionApplicationId" text NOT NULL,
        "PromotionPositionId" text NOT NULL,
        "ApplicantId" text NOT NULL,
        "ApplicantUnitId" text NOT NULL,
        "Status" text NOT NULL,
        "Materials" jsonb NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "CreatedBy" text NOT NULL,
        "UpdatedBy" text,
        "ApplicantPerformance" text NOT NULL,
        "HouPerformance" text NOT NULL,
        "AapscPerformance" text NOT NULL,
        "UapcPerformance" text NOT NULL,
        CONSTRAINT "PK_KnowledgeProfessionRecords" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE TABLE "NonAcademicAssessmentActivities" (
        "Id" text NOT NULL,
        "ApplicationId" text NOT NULL,
        "ApplicantId" text NOT NULL,
        "ApplicantName" text NOT NULL,
        "CommitteeLevel" text NOT NULL,
        "PerformedByStaffId" text NOT NULL,
        "PerformedByName" text NOT NULL,
        "PerformedByIsChairperson" boolean NOT NULL,
        "ActivityType" text NOT NULL,
        "Description" text NOT NULL,
        "CategoryAffected" text,
        "PreviousStatus" text,
        "NewStatus" text,
        "ActivityData" jsonb,
        "ActivityDate" timestamp with time zone NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "CreatedBy" text NOT NULL,
        "UpdatedBy" text,
        CONSTRAINT "PK_NonAcademicAssessmentActivities" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE TABLE "NonAcademicPromotionApplications" (
        "Id" text NOT NULL,
        "PromotionPositionId" text NOT NULL,
        "PromotionPosition" text NOT NULL,
        "ApplicantId" text NOT NULL,
        "ApplicantName" text NOT NULL,
        "ApplicantEmail" text NOT NULL,
        "ApplicantCurrentPosition" text NOT NULL,
        "ApplicantUnitId" text NOT NULL,
        "ApplicantUnitName" text NOT NULL,
        "IsActive" boolean NOT NULL,
        "SubmissionDate" timestamp with time zone,
        "ReviewStatus" text,
        "ReviewStatusHistory" text,
        "ApplicationStatus" text NOT NULL,
        "PerformanceCriteria" jsonb NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "CreatedBy" text NOT NULL,
        "UpdatedBy" text,
        CONSTRAINT "PK_NonAcademicPromotionApplications" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE TABLE "NonAcademicPromotionCommittees" (
        "Id" text NOT NULL,
        "StaffId" text NOT NULL,
        "CommitteeType" text NOT NULL,
        "CanSubmitReviewedApplication" boolean NOT NULL,
        "IsChairperson" boolean NOT NULL,
        "UnitId" text,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "CreatedBy" text NOT NULL,
        "UpdatedBy" text,
        CONSTRAINT "PK_NonAcademicPromotionCommittees" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE TABLE "NonAcademicPromotionPositions" (
        "Id" text NOT NULL,
        "Name" text NOT NULL,
        "PerformanceCriteria" jsonb NOT NULL,
        "MinimumNumberOfYearsFromLastPromotion" integer NOT NULL,
        "PreviousPosition" text,
        "MinimumNumberOfKnowledgeMaterials" integer NOT NULL,
        "MinimumNumberOfJournals" integer NOT NULL,
        "UnitType" text,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "CreatedBy" text NOT NULL,
        "UpdatedBy" text,
        CONSTRAINT "PK_NonAcademicPromotionPositions" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE TABLE "NonAcademicServiceRecords" (
        "Id" text NOT NULL,
        "PromotionApplicationId" text NOT NULL,
        "PromotionPositionId" text NOT NULL,
        "ApplicantId" text NOT NULL,
        "ApplicantUnitId" text NOT NULL,
        "Status" text NOT NULL,
        "ServiceToTheUniversity" jsonb NOT NULL,
        "ServiceToNationalAndInternational" jsonb NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "CreatedBy" text NOT NULL,
        "UpdatedBy" text,
        "ApplicantPerformance" text NOT NULL,
        "HouPerformance" text NOT NULL,
        "AapscPerformance" text NOT NULL,
        "UapcPerformance" text NOT NULL,
        CONSTRAINT "PK_NonAcademicServiceRecords" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE TABLE "PerformanceAtWorkRecords" (
        "Id" text NOT NULL,
        "PromotionApplicationId" text NOT NULL,
        "PromotionPositionId" text NOT NULL,
        "ApplicantId" text NOT NULL,
        "ApplicantUnitId" text NOT NULL,
        "Status" text NOT NULL,
        "TotalCategoriesAssessed" integer NOT NULL,
        "AccuracyOnSchedule" jsonb,
        "QualityOfWork" jsonb,
        "PunctualityAndRegularity" jsonb,
        "KnowledgeOfProcedures" jsonb,
        "AbilityToWorkOnOwn" jsonb,
        "AbilityToWorkUnderPressure" jsonb,
        "AdditionalResponsibility" jsonb,
        "HumanRelations" jsonb,
        "InitiativeAndForesight" jsonb,
        "AbilityToInspireAndMotivate" jsonb,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "CreatedBy" text NOT NULL,
        "UpdatedBy" text,
        "ApplicantPerformance" text NOT NULL,
        "HouPerformance" text NOT NULL,
        "AapscPerformance" text NOT NULL,
        "UapcPerformance" text NOT NULL,
        CONSTRAINT "PK_PerformanceAtWorkRecords" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE INDEX idx_na_knowledge_applicant_application ON "KnowledgeProfessionRecords" ("ApplicantId", "PromotionApplicationId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE INDEX idx_na_knowledge_applicant_status ON "KnowledgeProfessionRecords" ("ApplicantId", "Status");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE INDEX idx_na_knowledge_application_id ON "KnowledgeProfessionRecords" ("PromotionApplicationId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE INDEX idx_na_activity_app_committee_type ON "NonAcademicAssessmentActivities" ("ApplicationId", "CommitteeLevel", "ActivityType");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE INDEX idx_na_activity_app_type ON "NonAcademicAssessmentActivities" ("ApplicationId", "ActivityType");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE INDEX idx_na_activity_applicant_id ON "NonAcademicAssessmentActivities" ("ApplicantId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE INDEX idx_na_activity_application_id ON "NonAcademicAssessmentActivities" ("ApplicationId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE INDEX idx_na_application_applicant_active ON "NonAcademicPromotionApplications" ("ApplicantId", "IsActive");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE INDEX idx_na_application_applicant_id ON "NonAcademicPromotionApplications" ("ApplicantId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE INDEX idx_na_application_review_status ON "NonAcademicPromotionApplications" ("ReviewStatus", "ApplicationStatus");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE INDEX idx_na_application_review_status_single ON "NonAcademicPromotionApplications" ("ReviewStatus");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE INDEX idx_na_application_submission_date ON "NonAcademicPromotionApplications" ("SubmissionDate");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE INDEX idx_na_application_unit_id ON "NonAcademicPromotionApplications" ("ApplicantUnitId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE INDEX idx_na_committee_staff_chairperson ON "NonAcademicPromotionCommittees" ("StaffId", "IsChairperson");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE INDEX idx_na_committee_staff_id ON "NonAcademicPromotionCommittees" ("StaffId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE INDEX idx_na_committee_staff_type ON "NonAcademicPromotionCommittees" ("StaffId", "CommitteeType");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE INDEX idx_na_committee_type ON "NonAcademicPromotionCommittees" ("CommitteeType");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE INDEX idx_na_committee_unit_id ON "NonAcademicPromotionCommittees" ("UnitId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE INDEX idx_na_service_applicant_application ON "NonAcademicServiceRecords" ("ApplicantId", "PromotionApplicationId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE INDEX idx_na_service_applicant_status ON "NonAcademicServiceRecords" ("ApplicantId", "Status");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE INDEX idx_na_service_application_id ON "NonAcademicServiceRecords" ("PromotionApplicationId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE INDEX idx_na_work_applicant_application ON "PerformanceAtWorkRecords" ("ApplicantId", "PromotionApplicationId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE INDEX idx_na_work_applicant_status ON "PerformanceAtWorkRecords" ("ApplicantId", "Status");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    CREATE INDEX idx_na_work_application_id ON "PerformanceAtWorkRecords" ("PromotionApplicationId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260314132409_InitialNonAcademic') THEN
    INSERT INTO "nonAcademicPromotion"."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260314132409_InitialNonAcademic', '8.0.0');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260430170815_AddApplicationDocuments') THEN
    ALTER TABLE "NonAcademicPromotionApplications" ADD "ApplicationLetterFile" text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260430170815_AddApplicationDocuments') THEN
    ALTER TABLE "NonAcademicPromotionApplications" ADD "ApplicationLetterUploadedAt" timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260430170815_AddApplicationDocuments') THEN
    ALTER TABLE "NonAcademicPromotionApplications" ADD "CurriculumVitaeFile" text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260430170815_AddApplicationDocuments') THEN
    ALTER TABLE "NonAcademicPromotionApplications" ADD "CurriculumVitaeUploadedAt" timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "nonAcademicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260430170815_AddApplicationDocuments') THEN
    INSERT INTO "nonAcademicPromotion"."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260430170815_AddApplicationDocuments', '8.0.0');
    END IF;
END $EF$;
COMMIT;

