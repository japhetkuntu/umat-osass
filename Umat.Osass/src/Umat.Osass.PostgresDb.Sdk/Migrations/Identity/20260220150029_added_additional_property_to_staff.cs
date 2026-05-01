using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Umat.Osass.PostgresDb.Sdk.Migrations.Identity
{
    /// <inheritdoc />
    public partial class added_additional_property_to_staff : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SchoolIds",
                table: "Staffs");

            migrationBuilder.RenameColumn(
                name: "Rank",
                table: "Staffs",
                newName: "SchoolId");

            migrationBuilder.AlterColumn<string>(
                name: "FacultyId",
                table: "Staffs",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "DepartmentId",
                table: "Staffs",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastAppointmentOrPromotionDate",
                table: "Staffs",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Position",
                table: "Staffs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PreviousPosition",
                table: "Staffs",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastAppointmentOrPromotionDate",
                table: "Staffs");

            migrationBuilder.DropColumn(
                name: "Position",
                table: "Staffs");

            migrationBuilder.DropColumn(
                name: "PreviousPosition",
                table: "Staffs");

            migrationBuilder.RenameColumn(
                name: "SchoolId",
                table: "Staffs",
                newName: "Rank");

            migrationBuilder.AlterColumn<string>(
                name: "FacultyId",
                table: "Staffs",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "DepartmentId",
                table: "Staffs",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "SchoolIds",
                table: "Staffs",
                type: "text",
                nullable: true);
        }
    }
}
