using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Umat.Osass.PostgresDb.Sdk.Migrations.NonAcademic
{
    /// <inheritdoc />
    public partial class AddApplicationDocuments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApplicationLetterFile",
                table: "NonAcademicPromotionApplications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ApplicationLetterUploadedAt",
                table: "NonAcademicPromotionApplications",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurriculumVitaeFile",
                table: "NonAcademicPromotionApplications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CurriculumVitaeUploadedAt",
                table: "NonAcademicPromotionApplications",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApplicationLetterFile",
                table: "NonAcademicPromotionApplications");

            migrationBuilder.DropColumn(
                name: "ApplicationLetterUploadedAt",
                table: "NonAcademicPromotionApplications");

            migrationBuilder.DropColumn(
                name: "CurriculumVitaeFile",
                table: "NonAcademicPromotionApplications");

            migrationBuilder.DropColumn(
                name: "CurriculumVitaeUploadedAt",
                table: "NonAcademicPromotionApplications");
        }
    }
}
