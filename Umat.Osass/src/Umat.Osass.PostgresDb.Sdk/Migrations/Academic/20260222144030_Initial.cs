using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Umat.Osass.PostgresDb.Sdk.Migrations.Academic
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AcademicPromotionApplications",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    PromotionPositionId = table.Column<string>(type: "text", nullable: false),
                    PromotionPosition = table.Column<string>(type: "text", nullable: false),
                    ApplicantId = table.Column<string>(type: "text", nullable: false),
                    ApplicantName = table.Column<string>(type: "text", nullable: false),
                    ApplicantEmail = table.Column<string>(type: "text", nullable: false),
                    ApplicantCurrentPosition = table.Column<string>(type: "text", nullable: false),
                    ApplicantDepartmentId = table.Column<string>(type: "text", nullable: false),
                    ApplicantSchoolId = table.Column<string>(type: "text", nullable: false),
                    ApplicantFacultyId = table.Column<string>(type: "text", nullable: false),
                    ApplicantDepartmentName = table.Column<string>(type: "text", nullable: false),
                    ApplicantSchoolName = table.Column<string>(type: "text", nullable: false),
                    ApplicantFacultyName = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_AcademicPromotionApplications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AcademicPromotionCommittees",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    StaffId = table.Column<string>(type: "text", nullable: false),
                    CommitteeType = table.Column<string>(type: "text", nullable: false),
                    CanSubmitReviewedApplication = table.Column<bool>(type: "boolean", nullable: false),
                    IsChairperson = table.Column<bool>(type: "boolean", nullable: false),
                    DepartmentId = table.Column<string>(type: "text", nullable: true),
                    FacultyId = table.Column<string>(type: "text", nullable: true),
                    SchoolId = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AcademicPromotionCommittees", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AcademicPromotionPositions",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    PerformanceCriteria = table.Column<string>(type: "jsonb", nullable: false),
                    MinimumNumberOfYearsFromLastPromotion = table.Column<int>(type: "integer", nullable: false),
                    PreviousPosition = table.Column<string>(type: "text", nullable: true),
                    MinimumNumberOfPublications = table.Column<int>(type: "integer", nullable: false),
                    MinimumNumberOfRefereedJournal = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AcademicPromotionPositions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Publications",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    PromotionApplicationId = table.Column<string>(type: "text", nullable: false),
                    PromotionPositionId = table.Column<string>(type: "text", nullable: false),
                    ApplicantId = table.Column<string>(type: "text", nullable: false),
                    ApplicantDepartmentId = table.Column<string>(type: "text", nullable: false),
                    ApplicantSchoolId = table.Column<string>(type: "text", nullable: false),
                    ApplicantFacultyId = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Publications = table.Column<string>(type: "jsonb", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    ApplicantPerformance = table.Column<string>(type: "text", nullable: false),
                    DapcPerformance = table.Column<string>(type: "text", nullable: false),
                    FapcPerformance = table.Column<string>(type: "text", nullable: false),
                    UapcPerformance = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Publications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ServiceRecords",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    PromotionApplicationId = table.Column<string>(type: "text", nullable: false),
                    PromotionPositionId = table.Column<string>(type: "text", nullable: false),
                    ApplicantId = table.Column<string>(type: "text", nullable: false),
                    ApplicantDepartmentId = table.Column<string>(type: "text", nullable: false),
                    ApplicantSchoolId = table.Column<string>(type: "text", nullable: false),
                    ApplicantFacultyId = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ServiceToTheUniversity = table.Column<string>(type: "jsonb", nullable: false),
                    ServiceToNationalAndInternational = table.Column<string>(type: "jsonb", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    ApplicantPerformance = table.Column<string>(type: "text", nullable: false),
                    DapcPerformance = table.Column<string>(type: "text", nullable: false),
                    FapcPerformance = table.Column<string>(type: "text", nullable: false),
                    UapcPerformance = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceRecords", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TeachingRecords",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    PromotionApplicationId = table.Column<string>(type: "text", nullable: false),
                    PromotionPositionId = table.Column<string>(type: "text", nullable: false),
                    ApplicantId = table.Column<string>(type: "text", nullable: false),
                    ApplicantDepartmentId = table.Column<string>(type: "text", nullable: false),
                    ApplicantSchoolId = table.Column<string>(type: "text", nullable: false),
                    ApplicantFacultyId = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    TotalCategoriesAssessed = table.Column<int>(type: "integer", nullable: false),
                    LectureLoad = table.Column<string>(type: "jsonb", nullable: true),
                    AbilityToAdaptToTeaching = table.Column<string>(type: "jsonb", nullable: true),
                    RegularityAndPunctuality = table.Column<string>(type: "jsonb", nullable: true),
                    QualityOfLectureMaterial = table.Column<string>(type: "jsonb", nullable: true),
                    PerformanceOfStudentInExam = table.Column<string>(type: "jsonb", nullable: true),
                    AbilityToCompleteSyllabus = table.Column<string>(type: "jsonb", nullable: true),
                    QualityOfExamQuestionAndMarkingScheme = table.Column<string>(type: "jsonb", nullable: true),
                    PunctualityInSettingExamQuestion = table.Column<string>(type: "jsonb", nullable: true),
                    SupervisionOfProjectWorkAndThesis = table.Column<string>(type: "jsonb", nullable: true),
                    StudentReactionToAndAssessmentOfTeaching = table.Column<string>(type: "jsonb", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    ApplicantPerformance = table.Column<string>(type: "text", nullable: false),
                    DapcPerformance = table.Column<string>(type: "text", nullable: false),
                    FapcPerformance = table.Column<string>(type: "text", nullable: false),
                    UapcPerformance = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeachingRecords", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AcademicPromotionApplications");

            migrationBuilder.DropTable(
                name: "AcademicPromotionCommittees");

            migrationBuilder.DropTable(
                name: "AcademicPromotionPositions");

            migrationBuilder.DropTable(
                name: "Publications");

            migrationBuilder.DropTable(
                name: "ServiceRecords");

            migrationBuilder.DropTable(
                name: "TeachingRecords");
        }
    }
}
