using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Umat.Osass.PostgresDb.Sdk.Migrations.Academic
{
    /// <inheritdoc />
    public partial class ReplaceServiceRecordListsWithFlatServices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ServiceToNationalAndInternational",
                table: "ServiceRecords");

            migrationBuilder.RenameColumn(
                name: "ServiceToTheUniversity",
                table: "ServiceRecords",
                newName: "Services");

            // Existing rows hold data in the old ServiceRecordsData shape (ServiceTitle/Role/Duration/
            // ServiceTypeId), which does not match the new ServiceRecordItem shape (ServicePositionId/
            // CategoryId/CategoryName/PositionName/CommitteeName). Per the design decision, existing
            // ServiceRecords are confirmed synthetic seed data, not real user submissions, so reset the
            // column to an empty array rather than leaving half-migrated, uncategorized garbage rows.
            migrationBuilder.Sql(@"UPDATE ""ServiceRecords"" SET ""Services"" = '[]'::jsonb;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Services",
                table: "ServiceRecords",
                newName: "ServiceToTheUniversity");

            migrationBuilder.AddColumn<string>(
                name: "ServiceToNationalAndInternational",
                table: "ServiceRecords",
                type: "jsonb",
                nullable: false,
                defaultValue: "");
        }
    }
}
