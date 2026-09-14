using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Umat.Osass.PostgresDb.Sdk.Migrations.Identity
{
    /// <inheritdoc />
    public partial class AddServiceCategoryAndLinkServicePositions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ServiceType",
                table: "ServicePositions",
                newName: "CategoryId");

            migrationBuilder.CreateTable(
                name: "ServiceCategories",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    RequiresDesignation = table.Column<bool>(type: "boolean", nullable: false),
                    RequiresCommitteeName = table.Column<bool>(type: "boolean", nullable: false),
                    ActingScoreMultiplier = table.Column<double>(type: "double precision", nullable: false),
                    FullTimeScoreMultiplier = table.Column<double>(type: "double precision", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceCategories", x => x.Id);
                });

            migrationBuilder.Sql(@"
                INSERT INTO ""ServiceCategories""
                    (""Id"", ""Name"", ""Description"", ""RequiresDesignation"", ""RequiresCommitteeName"", ""ActingScoreMultiplier"", ""FullTimeScoreMultiplier"", ""DisplayOrder"", ""CreatedAt"", ""CreatedBy"")
                VALUES
                    ('svc-cat-admin-experience', 'Administrative Experience', NULL, TRUE, FALSE, 0.5, 1.0, 1, NOW(), 'system'),
                    ('svc-cat-statutory', 'Statutory', NULL, FALSE, TRUE, 0.5, 1.0, 2, NOW(), 'system'),
                    ('svc-cat-adhoc', 'Adhoc/Non-statutory', NULL, FALSE, TRUE, 0.5, 1.0, 3, NOW(), 'system'),
                    ('svc-cat-other-committee', 'Other Services/Committee Served', NULL, FALSE, TRUE, 0.5, 1.0, 4, NOW(), 'system'),
                    ('svc-cat-other-national', 'Other Service to National Community', NULL, FALSE, TRUE, 0.5, 1.0, 5, NOW(), 'system'),
                    ('svc-cat-other-international', 'Other Service to International Community', NULL, FALSE, TRUE, 0.5, 1.0, 6, NOW(), 'system');
            ");

            // The renamed CategoryId column still holds the old free-text ServiceType values
            // (e.g. ""Academic""), which are not valid category ids. Backfill every existing
            // ServicePosition row to Administrative Experience so the NOT NULL/app-level FK holds;
            // admins can re-assign the correct category afterward via the admin portal.
            migrationBuilder.Sql(@"UPDATE ""ServicePositions"" SET ""CategoryId"" = 'svc-cat-admin-experience';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServiceCategories");

            migrationBuilder.RenameColumn(
                name: "CategoryId",
                table: "ServicePositions",
                newName: "ServiceType");
        }
    }
}
