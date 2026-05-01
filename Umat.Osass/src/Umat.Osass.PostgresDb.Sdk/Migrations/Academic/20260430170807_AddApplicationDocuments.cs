using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Umat.Osass.PostgresDb.Sdk.Migrations.Academic
{
    /// <inheritdoc />
    public partial class AddApplicationDocuments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApplicationLetterFile",
                table: "AcademicPromotionApplications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ApplicationLetterUploadedAt",
                table: "AcademicPromotionApplications",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurriculumVitaeFile",
                table: "AcademicPromotionApplications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CurriculumVitaeUploadedAt",
                table: "AcademicPromotionApplications",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApplicationLetterFile",
                table: "AcademicPromotionApplications");

            migrationBuilder.DropColumn(
                name: "ApplicationLetterUploadedAt",
                table: "AcademicPromotionApplications");

            migrationBuilder.DropColumn(
                name: "CurriculumVitaeFile",
                table: "AcademicPromotionApplications");

            migrationBuilder.DropColumn(
                name: "CurriculumVitaeUploadedAt",
                table: "AcademicPromotionApplications");
        }
    }
}
