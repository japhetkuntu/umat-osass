DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'academicPromotion') THEN
        CREATE SCHEMA "academicPromotion";
    END IF;
END $EF$;
CREATE TABLE IF NOT EXISTS "academicPromotion"."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260222144030_Initial') THEN
    CREATE TABLE "AcademicPromotionApplications" (
        "Id" text NOT NULL,
        "PromotionPositionId" text NOT NULL,
        "PromotionPosition" text NOT NULL,
        "ApplicantId" text NOT NULL,
        "ApplicantName" text NOT NULL,
        "ApplicantEmail" text NOT NULL,
        "ApplicantCurrentPosition" text NOT NULL,
        "ApplicantDepartmentId" text NOT NULL,
        "ApplicantSchoolId" text NOT NULL,
        "ApplicantFacultyId" text NOT NULL,
        "ApplicantDepartmentName" text NOT NULL,
        "ApplicantSchoolName" text NOT NULL,
        "ApplicantFacultyName" text NOT NULL,
        "IsActive" boolean NOT NULL,
        "ReviewStatus" text,
        "ReviewStatusHistory" text,
        "ApplicationStatus" text NOT NULL,
        "PerformanceCriteria" jsonb NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "CreatedBy" text NOT NULL,
        "UpdatedBy" text,
        CONSTRAINT "PK_AcademicPromotionApplications" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260222144030_Initial') THEN
    CREATE TABLE "AcademicPromotionCommittees" (
        "Id" text NOT NULL,
        "StaffId" text NOT NULL,
        "CommitteeType" text NOT NULL,
        "CanSubmitReviewedApplication" boolean NOT NULL,
        "IsChairperson" boolean NOT NULL,
        "DepartmentId" text,
        "FacultyId" text,
        "SchoolId" text,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "CreatedBy" text NOT NULL,
        "UpdatedBy" text,
        CONSTRAINT "PK_AcademicPromotionCommittees" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260222144030_Initial') THEN
    CREATE TABLE "AcademicPromotionPositions" (
        "Id" text NOT NULL,
        "Name" text NOT NULL,
        "PerformanceCriteria" jsonb NOT NULL,
        "MinimumNumberOfYearsFromLastPromotion" integer NOT NULL,
        "PreviousPosition" text,
        "MinimumNumberOfPublications" integer NOT NULL,
        "MinimumNumberOfRefereedJournal" integer NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "CreatedBy" text NOT NULL,
        "UpdatedBy" text,
        CONSTRAINT "PK_AcademicPromotionPositions" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260222144030_Initial') THEN
    CREATE TABLE "Publications" (
        "Id" text NOT NULL,
        "PromotionApplicationId" text NOT NULL,
        "PromotionPositionId" text NOT NULL,
        "ApplicantId" text NOT NULL,
        "ApplicantDepartmentId" text NOT NULL,
        "ApplicantSchoolId" text NOT NULL,
        "ApplicantFacultyId" text NOT NULL,
        "Status" text NOT NULL,
        "Publications" jsonb NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "CreatedBy" text NOT NULL,
        "UpdatedBy" text,
        "ApplicantPerformance" text NOT NULL,
        "DapcPerformance" text NOT NULL,
        "FapcPerformance" text NOT NULL,
        "UapcPerformance" text NOT NULL,
        CONSTRAINT "PK_Publications" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260222144030_Initial') THEN
    CREATE TABLE "ServiceRecords" (
        "Id" text NOT NULL,
        "PromotionApplicationId" text NOT NULL,
        "PromotionPositionId" text NOT NULL,
        "ApplicantId" text NOT NULL,
        "ApplicantDepartmentId" text NOT NULL,
        "ApplicantSchoolId" text NOT NULL,
        "ApplicantFacultyId" text NOT NULL,
        "Status" text NOT NULL,
        "ServiceToTheUniversity" jsonb NOT NULL,
        "ServiceToNationalAndInternational" jsonb NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "CreatedBy" text NOT NULL,
        "UpdatedBy" text,
        "ApplicantPerformance" text NOT NULL,
        "DapcPerformance" text NOT NULL,
        "FapcPerformance" text NOT NULL,
        "UapcPerformance" text NOT NULL,
        CONSTRAINT "PK_ServiceRecords" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260222144030_Initial') THEN
    CREATE TABLE "TeachingRecords" (
        "Id" text NOT NULL,
        "PromotionApplicationId" text NOT NULL,
        "PromotionPositionId" text NOT NULL,
        "ApplicantId" text NOT NULL,
        "ApplicantDepartmentId" text NOT NULL,
        "ApplicantSchoolId" text NOT NULL,
        "ApplicantFacultyId" text NOT NULL,
        "Status" text NOT NULL,
        "TotalCategoriesAssessed" integer NOT NULL,
        "LectureLoad" jsonb,
        "AbilityToAdaptToTeaching" jsonb,
        "RegularityAndPunctuality" jsonb,
        "QualityOfLectureMaterial" jsonb,
        "PerformanceOfStudentInExam" jsonb,
        "AbilityToCompleteSyllabus" jsonb,
        "QualityOfExamQuestionAndMarkingScheme" jsonb,
        "PunctualityInSettingExamQuestion" jsonb,
        "SupervisionOfProjectWorkAndThesis" jsonb,
        "StudentReactionToAndAssessmentOfTeaching" jsonb,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "CreatedBy" text NOT NULL,
        "UpdatedBy" text,
        "ApplicantPerformance" text NOT NULL,
        "DapcPerformance" text NOT NULL,
        "FapcPerformance" text NOT NULL,
        "UapcPerformance" text NOT NULL,
        CONSTRAINT "PK_TeachingRecords" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260222144030_Initial') THEN
    INSERT INTO "academicPromotion"."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260222144030_Initial', '8.0.0');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260310171720_added_submission_date') THEN
    ALTER TABLE "AcademicPromotionApplications" ADD "SubmissionDate" timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260310171720_added_submission_date') THEN
    INSERT INTO "academicPromotion"."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260310171720_added_submission_date', '8.0.0');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260310185652_added_assessment_history') THEN
    CREATE TABLE "AssessmentActivities" (
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
        CONSTRAINT "PK_AssessmentActivities" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260310185652_added_assessment_history') THEN
    INSERT INTO "academicPromotion"."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260310185652_added_assessment_history', '8.0.0');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    CREATE INDEX idx_teaching_applicant_application ON "TeachingRecords" ("ApplicantId", "PromotionApplicationId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    CREATE INDEX idx_teaching_applicant_status ON "TeachingRecords" ("ApplicantId", "Status");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    CREATE INDEX idx_teaching_application_id ON "TeachingRecords" ("PromotionApplicationId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    CREATE INDEX idx_service_applicant_application ON "ServiceRecords" ("ApplicantId", "PromotionApplicationId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    CREATE INDEX idx_service_applicant_status ON "ServiceRecords" ("ApplicantId", "Status");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    CREATE INDEX idx_service_application_id ON "ServiceRecords" ("PromotionApplicationId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    CREATE INDEX idx_publication_applicant_application ON "Publications" ("ApplicantId", "PromotionApplicationId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    CREATE INDEX idx_publication_applicant_status ON "Publications" ("ApplicantId", "Status");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    CREATE INDEX idx_publication_application_id ON "Publications" ("PromotionApplicationId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    CREATE INDEX idx_activity_app_committee_type ON "AssessmentActivities" ("ApplicationId", "CommitteeLevel", "ActivityType");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    CREATE INDEX idx_activity_app_type ON "AssessmentActivities" ("ApplicationId", "ActivityType");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    CREATE INDEX idx_activity_application_id ON "AssessmentActivities" ("ApplicationId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    CREATE INDEX idx_activity_date ON "AssessmentActivities" ("ActivityDate");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    CREATE INDEX idx_activity_staff_date ON "AssessmentActivities" ("PerformedByStaffId", "ActivityDate");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    CREATE INDEX idx_activity_type ON "AssessmentActivities" ("ActivityType");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    CREATE INDEX idx_committee_staff_chairperson ON "AcademicPromotionCommittees" ("StaffId", "IsChairperson");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    CREATE INDEX idx_committee_staff_id ON "AcademicPromotionCommittees" ("StaffId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    CREATE INDEX idx_committee_staff_type ON "AcademicPromotionCommittees" ("StaffId", "CommitteeType");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    CREATE INDEX idx_committee_type ON "AcademicPromotionCommittees" ("CommitteeType");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    CREATE INDEX idx_application_applicant_active ON "AcademicPromotionApplications" ("ApplicantId", "IsActive");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    CREATE INDEX idx_application_applicant_id ON "AcademicPromotionApplications" ("ApplicantId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    CREATE INDEX idx_application_review_status ON "AcademicPromotionApplications" ("ReviewStatus", "ApplicationStatus");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    CREATE INDEX idx_application_review_status_single ON "AcademicPromotionApplications" ("ReviewStatus");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    CREATE INDEX idx_application_submission_date ON "AcademicPromotionApplications" ("SubmissionDate");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260311195631_AddPerformanceIndexes') THEN
    INSERT INTO "academicPromotion"."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260311195631_AddPerformanceIndexes', '8.0.0');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260430170807_AddApplicationDocuments') THEN
    ALTER TABLE "AcademicPromotionApplications" ADD "ApplicationLetterFile" text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260430170807_AddApplicationDocuments') THEN
    ALTER TABLE "AcademicPromotionApplications" ADD "ApplicationLetterUploadedAt" timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260430170807_AddApplicationDocuments') THEN
    ALTER TABLE "AcademicPromotionApplications" ADD "CurriculumVitaeFile" text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260430170807_AddApplicationDocuments') THEN
    ALTER TABLE "AcademicPromotionApplications" ADD "CurriculumVitaeUploadedAt" timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "academicPromotion"."__EFMigrationsHistory" WHERE "MigrationId" = '20260430170807_AddApplicationDocuments') THEN
    INSERT INTO "academicPromotion"."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260430170807_AddApplicationDocuments', '8.0.0');
    END IF;
END $EF$;
COMMIT;

