using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Umat.Osass.PostgresDb.Sdk.Migrations.Academic
{
    /// <inheritdoc />
    public partial class AddPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "idx_teaching_applicant_application",
                table: "TeachingRecords",
                columns: new[] { "ApplicantId", "PromotionApplicationId" });

            migrationBuilder.CreateIndex(
                name: "idx_teaching_applicant_status",
                table: "TeachingRecords",
                columns: new[] { "ApplicantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "idx_teaching_application_id",
                table: "TeachingRecords",
                column: "PromotionApplicationId");

            migrationBuilder.CreateIndex(
                name: "idx_service_applicant_application",
                table: "ServiceRecords",
                columns: new[] { "ApplicantId", "PromotionApplicationId" });

            migrationBuilder.CreateIndex(
                name: "idx_service_applicant_status",
                table: "ServiceRecords",
                columns: new[] { "ApplicantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "idx_service_application_id",
                table: "ServiceRecords",
                column: "PromotionApplicationId");

            migrationBuilder.CreateIndex(
                name: "idx_publication_applicant_application",
                table: "Publications",
                columns: new[] { "ApplicantId", "PromotionApplicationId" });

            migrationBuilder.CreateIndex(
                name: "idx_publication_applicant_status",
                table: "Publications",
                columns: new[] { "ApplicantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "idx_publication_application_id",
                table: "Publications",
                column: "PromotionApplicationId");

            migrationBuilder.CreateIndex(
                name: "idx_activity_app_committee_type",
                table: "AssessmentActivities",
                columns: new[] { "ApplicationId", "CommitteeLevel", "ActivityType" });

            migrationBuilder.CreateIndex(
                name: "idx_activity_app_type",
                table: "AssessmentActivities",
                columns: new[] { "ApplicationId", "ActivityType" });

            migrationBuilder.CreateIndex(
                name: "idx_activity_application_id",
                table: "AssessmentActivities",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "idx_activity_date",
                table: "AssessmentActivities",
                column: "ActivityDate");

            migrationBuilder.CreateIndex(
                name: "idx_activity_staff_date",
                table: "AssessmentActivities",
                columns: new[] { "PerformedByStaffId", "ActivityDate" });

            migrationBuilder.CreateIndex(
                name: "idx_activity_type",
                table: "AssessmentActivities",
                column: "ActivityType");

            migrationBuilder.CreateIndex(
                name: "idx_committee_staff_chairperson",
                table: "AcademicPromotionCommittees",
                columns: new[] { "StaffId", "IsChairperson" });

            migrationBuilder.CreateIndex(
                name: "idx_committee_staff_id",
                table: "AcademicPromotionCommittees",
                column: "StaffId");

            migrationBuilder.CreateIndex(
                name: "idx_committee_staff_type",
                table: "AcademicPromotionCommittees",
                columns: new[] { "StaffId", "CommitteeType" });

            migrationBuilder.CreateIndex(
                name: "idx_committee_type",
                table: "AcademicPromotionCommittees",
                column: "CommitteeType");

            migrationBuilder.CreateIndex(
                name: "idx_application_applicant_active",
                table: "AcademicPromotionApplications",
                columns: new[] { "ApplicantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "idx_application_applicant_id",
                table: "AcademicPromotionApplications",
                column: "ApplicantId");

            migrationBuilder.CreateIndex(
                name: "idx_application_review_status",
                table: "AcademicPromotionApplications",
                columns: new[] { "ReviewStatus", "ApplicationStatus" });

            migrationBuilder.CreateIndex(
                name: "idx_application_review_status_single",
                table: "AcademicPromotionApplications",
                column: "ReviewStatus");

            migrationBuilder.CreateIndex(
                name: "idx_application_submission_date",
                table: "AcademicPromotionApplications",
                column: "SubmissionDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_teaching_applicant_application",
                table: "TeachingRecords");

            migrationBuilder.DropIndex(
                name: "idx_teaching_applicant_status",
                table: "TeachingRecords");

            migrationBuilder.DropIndex(
                name: "idx_teaching_application_id",
                table: "TeachingRecords");

            migrationBuilder.DropIndex(
                name: "idx_service_applicant_application",
                table: "ServiceRecords");

            migrationBuilder.DropIndex(
                name: "idx_service_applicant_status",
                table: "ServiceRecords");

            migrationBuilder.DropIndex(
                name: "idx_service_application_id",
                table: "ServiceRecords");

            migrationBuilder.DropIndex(
                name: "idx_publication_applicant_application",
                table: "Publications");

            migrationBuilder.DropIndex(
                name: "idx_publication_applicant_status",
                table: "Publications");

            migrationBuilder.DropIndex(
                name: "idx_publication_application_id",
                table: "Publications");

            migrationBuilder.DropIndex(
                name: "idx_activity_app_committee_type",
                table: "AssessmentActivities");

            migrationBuilder.DropIndex(
                name: "idx_activity_app_type",
                table: "AssessmentActivities");

            migrationBuilder.DropIndex(
                name: "idx_activity_application_id",
                table: "AssessmentActivities");

            migrationBuilder.DropIndex(
                name: "idx_activity_date",
                table: "AssessmentActivities");

            migrationBuilder.DropIndex(
                name: "idx_activity_staff_date",
                table: "AssessmentActivities");

            migrationBuilder.DropIndex(
                name: "idx_activity_type",
                table: "AssessmentActivities");

            migrationBuilder.DropIndex(
                name: "idx_committee_staff_chairperson",
                table: "AcademicPromotionCommittees");

            migrationBuilder.DropIndex(
                name: "idx_committee_staff_id",
                table: "AcademicPromotionCommittees");

            migrationBuilder.DropIndex(
                name: "idx_committee_staff_type",
                table: "AcademicPromotionCommittees");

            migrationBuilder.DropIndex(
                name: "idx_committee_type",
                table: "AcademicPromotionCommittees");

            migrationBuilder.DropIndex(
                name: "idx_application_applicant_active",
                table: "AcademicPromotionApplications");

            migrationBuilder.DropIndex(
                name: "idx_application_applicant_id",
                table: "AcademicPromotionApplications");

            migrationBuilder.DropIndex(
                name: "idx_application_review_status",
                table: "AcademicPromotionApplications");

            migrationBuilder.DropIndex(
                name: "idx_application_review_status_single",
                table: "AcademicPromotionApplications");

            migrationBuilder.DropIndex(
                name: "idx_application_submission_date",
                table: "AcademicPromotionApplications");
        }
    }
}
