using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Umat.Osass.PostgresDb.Sdk.Migrations.NonAcademic
{
    /// <inheritdoc />
    public partial class InitialNonAcademic : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "KnowledgeProfessionRecords",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    PromotionApplicationId = table.Column<string>(type: "text", nullable: false),
                    PromotionPositionId = table.Column<string>(type: "text", nullable: false),
                    ApplicantId = table.Column<string>(type: "text", nullable: false),
                    ApplicantUnitId = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Materials = table.Column<string>(type: "jsonb", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    ApplicantPerformance = table.Column<string>(type: "text", nullable: false),
                    HouPerformance = table.Column<string>(type: "text", nullable: false),
                    AapscPerformance = table.Column<string>(type: "text", nullable: false),
                    UapcPerformance = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KnowledgeProfessionRecords", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NonAcademicAssessmentActivities",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    ApplicationId = table.Column<string>(type: "text", nullable: false),
                    ApplicantId = table.Column<string>(type: "text", nullable: false),
                    ApplicantName = table.Column<string>(type: "text", nullable: false),
                    CommitteeLevel = table.Column<string>(type: "text", nullable: false),
                    PerformedByStaffId = table.Column<string>(type: "text", nullable: false),
                    PerformedByName = table.Column<string>(type: "text", nullable: false),
                    PerformedByIsChairperson = table.Column<bool>(type: "boolean", nullable: false),
                    ActivityType = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    CategoryAffected = table.Column<string>(type: "text", nullable: true),
                    PreviousStatus = table.Column<string>(type: "text", nullable: true),
                    NewStatus = table.Column<string>(type: "text", nullable: true),
                    ActivityData = table.Column<string>(type: "jsonb", nullable: true),
                    ActivityDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NonAcademicAssessmentActivities", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NonAcademicPromotionApplications",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    PromotionPositionId = table.Column<string>(type: "text", nullable: false),
                    PromotionPosition = table.Column<string>(type: "text", nullable: false),
                    ApplicantId = table.Column<string>(type: "text", nullable: false),
                    ApplicantName = table.Column<string>(type: "text", nullable: false),
                    ApplicantEmail = table.Column<string>(type: "text", nullable: false),
                    ApplicantCurrentPosition = table.Column<string>(type: "text", nullable: false),
                    ApplicantUnitId = table.Column<string>(type: "text", nullable: false),
                    ApplicantUnitName = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    SubmissionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReviewStatus = table.Column<string>(type: "text", nullable: true),
                    ReviewStatusHistory = table.Column<string>(type: "text", nullable: true),
                    ApplicationStatus = table.Column<string>(type: "text", nullable: false),
                    PerformanceCriteria = table.Column<string>(type: "jsonb", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NonAcademicPromotionApplications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NonAcademicPromotionCommittees",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    StaffId = table.Column<string>(type: "text", nullable: false),
                    CommitteeType = table.Column<string>(type: "text", nullable: false),
                    CanSubmitReviewedApplication = table.Column<bool>(type: "boolean", nullable: false),
                    IsChairperson = table.Column<bool>(type: "boolean", nullable: false),
                    UnitId = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NonAcademicPromotionCommittees", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NonAcademicPromotionPositions",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    PerformanceCriteria = table.Column<string>(type: "jsonb", nullable: false),
                    MinimumNumberOfYearsFromLastPromotion = table.Column<int>(type: "integer", nullable: false),
                    PreviousPosition = table.Column<string>(type: "text", nullable: true),
                    MinimumNumberOfKnowledgeMaterials = table.Column<int>(type: "integer", nullable: false),
                    MinimumNumberOfJournals = table.Column<int>(type: "integer", nullable: false),
                    UnitType = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NonAcademicPromotionPositions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NonAcademicServiceRecords",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    PromotionApplicationId = table.Column<string>(type: "text", nullable: false),
                    PromotionPositionId = table.Column<string>(type: "text", nullable: false),
                    ApplicantId = table.Column<string>(type: "text", nullable: false),
                    ApplicantUnitId = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ServiceToTheUniversity = table.Column<string>(type: "jsonb", nullable: false),
                    ServiceToNationalAndInternational = table.Column<string>(type: "jsonb", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    ApplicantPerformance = table.Column<string>(type: "text", nullable: false),
                    HouPerformance = table.Column<string>(type: "text", nullable: false),
                    AapscPerformance = table.Column<string>(type: "text", nullable: false),
                    UapcPerformance = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NonAcademicServiceRecords", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PerformanceAtWorkRecords",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    PromotionApplicationId = table.Column<string>(type: "text", nullable: false),
                    PromotionPositionId = table.Column<string>(type: "text", nullable: false),
                    ApplicantId = table.Column<string>(type: "text", nullable: false),
                    ApplicantUnitId = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    TotalCategoriesAssessed = table.Column<int>(type: "integer", nullable: false),
                    AccuracyOnSchedule = table.Column<string>(type: "jsonb", nullable: true),
                    QualityOfWork = table.Column<string>(type: "jsonb", nullable: true),
                    PunctualityAndRegularity = table.Column<string>(type: "jsonb", nullable: true),
                    KnowledgeOfProcedures = table.Column<string>(type: "jsonb", nullable: true),
                    AbilityToWorkOnOwn = table.Column<string>(type: "jsonb", nullable: true),
                    AbilityToWorkUnderPressure = table.Column<string>(type: "jsonb", nullable: true),
                    AdditionalResponsibility = table.Column<string>(type: "jsonb", nullable: true),
                    HumanRelations = table.Column<string>(type: "jsonb", nullable: true),
                    InitiativeAndForesight = table.Column<string>(type: "jsonb", nullable: true),
                    AbilityToInspireAndMotivate = table.Column<string>(type: "jsonb", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    ApplicantPerformance = table.Column<string>(type: "text", nullable: false),
                    HouPerformance = table.Column<string>(type: "text", nullable: false),
                    AapscPerformance = table.Column<string>(type: "text", nullable: false),
                    UapcPerformance = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PerformanceAtWorkRecords", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "idx_na_knowledge_applicant_application",
                table: "KnowledgeProfessionRecords",
                columns: new[] { "ApplicantId", "PromotionApplicationId" });

            migrationBuilder.CreateIndex(
                name: "idx_na_knowledge_applicant_status",
                table: "KnowledgeProfessionRecords",
                columns: new[] { "ApplicantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "idx_na_knowledge_application_id",
                table: "KnowledgeProfessionRecords",
                column: "PromotionApplicationId");

            migrationBuilder.CreateIndex(
                name: "idx_na_activity_app_committee_type",
                table: "NonAcademicAssessmentActivities",
                columns: new[] { "ApplicationId", "CommitteeLevel", "ActivityType" });

            migrationBuilder.CreateIndex(
                name: "idx_na_activity_app_type",
                table: "NonAcademicAssessmentActivities",
                columns: new[] { "ApplicationId", "ActivityType" });

            migrationBuilder.CreateIndex(
                name: "idx_na_activity_applicant_id",
                table: "NonAcademicAssessmentActivities",
                column: "ApplicantId");

            migrationBuilder.CreateIndex(
                name: "idx_na_activity_application_id",
                table: "NonAcademicAssessmentActivities",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "idx_na_application_applicant_active",
                table: "NonAcademicPromotionApplications",
                columns: new[] { "ApplicantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "idx_na_application_applicant_id",
                table: "NonAcademicPromotionApplications",
                column: "ApplicantId");

            migrationBuilder.CreateIndex(
                name: "idx_na_application_review_status",
                table: "NonAcademicPromotionApplications",
                columns: new[] { "ReviewStatus", "ApplicationStatus" });

            migrationBuilder.CreateIndex(
                name: "idx_na_application_review_status_single",
                table: "NonAcademicPromotionApplications",
                column: "ReviewStatus");

            migrationBuilder.CreateIndex(
                name: "idx_na_application_submission_date",
                table: "NonAcademicPromotionApplications",
                column: "SubmissionDate");

            migrationBuilder.CreateIndex(
                name: "idx_na_application_unit_id",
                table: "NonAcademicPromotionApplications",
                column: "ApplicantUnitId");

            migrationBuilder.CreateIndex(
                name: "idx_na_committee_staff_chairperson",
                table: "NonAcademicPromotionCommittees",
                columns: new[] { "StaffId", "IsChairperson" });

            migrationBuilder.CreateIndex(
                name: "idx_na_committee_staff_id",
                table: "NonAcademicPromotionCommittees",
                column: "StaffId");

            migrationBuilder.CreateIndex(
                name: "idx_na_committee_staff_type",
                table: "NonAcademicPromotionCommittees",
                columns: new[] { "StaffId", "CommitteeType" });

            migrationBuilder.CreateIndex(
                name: "idx_na_committee_type",
                table: "NonAcademicPromotionCommittees",
                column: "CommitteeType");

            migrationBuilder.CreateIndex(
                name: "idx_na_committee_unit_id",
                table: "NonAcademicPromotionCommittees",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "idx_na_service_applicant_application",
                table: "NonAcademicServiceRecords",
                columns: new[] { "ApplicantId", "PromotionApplicationId" });

            migrationBuilder.CreateIndex(
                name: "idx_na_service_applicant_status",
                table: "NonAcademicServiceRecords",
                columns: new[] { "ApplicantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "idx_na_service_application_id",
                table: "NonAcademicServiceRecords",
                column: "PromotionApplicationId");

            migrationBuilder.CreateIndex(
                name: "idx_na_work_applicant_application",
                table: "PerformanceAtWorkRecords",
                columns: new[] { "ApplicantId", "PromotionApplicationId" });

            migrationBuilder.CreateIndex(
                name: "idx_na_work_applicant_status",
                table: "PerformanceAtWorkRecords",
                columns: new[] { "ApplicantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "idx_na_work_application_id",
                table: "PerformanceAtWorkRecords",
                column: "PromotionApplicationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "KnowledgeProfessionRecords");

            migrationBuilder.DropTable(
                name: "NonAcademicAssessmentActivities");

            migrationBuilder.DropTable(
                name: "NonAcademicPromotionApplications");

            migrationBuilder.DropTable(
                name: "NonAcademicPromotionCommittees");

            migrationBuilder.DropTable(
                name: "NonAcademicPromotionPositions");

            migrationBuilder.DropTable(
                name: "NonAcademicServiceRecords");

            migrationBuilder.DropTable(
                name: "PerformanceAtWorkRecords");
        }
    }
}
