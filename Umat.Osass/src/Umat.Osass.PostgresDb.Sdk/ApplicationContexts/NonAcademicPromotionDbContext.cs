using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Umat.Osass.PostgresDb.Sdk.Entities.NonAcademicPromotion;

namespace Umat.Osass.PostgresDb.Sdk.ApplicationContexts;

public class NonAcademicPromotionDbContext : DbContext
{
    public NonAcademicPromotionDbContext(DbContextOptions<NonAcademicPromotionDbContext> options) : base(options) { }

    public DbSet<NonAcademicPromotionApplication> NonAcademicPromotionApplications => Set<NonAcademicPromotionApplication>();
    public DbSet<NonAcademicPromotionCommittee> NonAcademicPromotionCommittees => Set<NonAcademicPromotionCommittee>();
    public DbSet<NonAcademicPromotionPosition> NonAcademicPromotionPositions => Set<NonAcademicPromotionPosition>();
    public DbSet<PerformanceAtWorkRecord> PerformanceAtWorkRecords => Set<PerformanceAtWorkRecord>();
    public DbSet<KnowledgeProfessionRecord> KnowledgeProfessionRecords => Set<KnowledgeProfessionRecord>();
    public DbSet<NonAcademicServiceRecord> NonAcademicServiceRecords => Set<NonAcademicServiceRecord>();
    public DbSet<NonAcademicAssessmentActivity> NonAcademicAssessmentActivities => Set<NonAcademicAssessmentActivity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<NonAcademicPromotionPosition>(entity =>
        {
            entity.Property(e => e.PerformanceCriteria)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null));
        });

        modelBuilder.Entity<NonAcademicPromotionApplication>(entity =>
        {
            entity.Property(e => e.PerformanceCriteria)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null));

            entity.HasIndex(e => new { e.ApplicantId, e.IsActive })
                .HasName("idx_na_application_applicant_active");
            entity.HasIndex(e => new { e.ReviewStatus, e.ApplicationStatus })
                .HasName("idx_na_application_review_status");
            entity.HasIndex(e => e.SubmissionDate)
                .HasName("idx_na_application_submission_date");
            entity.HasIndex(e => e.ApplicantId)
                .HasName("idx_na_application_applicant_id");
            entity.HasIndex(e => e.ReviewStatus)
                .HasName("idx_na_application_review_status_single");
            entity.HasIndex(e => e.ApplicantUnitId)
                .HasName("idx_na_application_unit_id");
        });

        modelBuilder.Entity<KnowledgeProfessionRecord>(entity =>
        {
            entity.Property(e => e.Materials)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<List<KnowledgeProfessionItem>>(v, (JsonSerializerOptions)null));

            entity.HasIndex(e => e.PromotionApplicationId)
                .HasName("idx_na_knowledge_application_id");
            entity.HasIndex(e => new { e.ApplicantId, e.PromotionApplicationId })
                .HasName("idx_na_knowledge_applicant_application");
            entity.HasIndex(e => new { e.ApplicantId, e.Status })
                .HasName("idx_na_knowledge_applicant_status");
        });

        modelBuilder.Entity<NonAcademicPromotionCommittee>(entity =>
        {
            entity.HasIndex(e => new { e.StaffId, e.CommitteeType })
                .HasName("idx_na_committee_staff_type");
            entity.HasIndex(e => new { e.StaffId, e.IsChairperson })
                .HasName("idx_na_committee_staff_chairperson");
            entity.HasIndex(e => e.StaffId)
                .HasName("idx_na_committee_staff_id");
            entity.HasIndex(e => e.CommitteeType)
                .HasName("idx_na_committee_type");
            entity.HasIndex(e => e.UnitId)
                .HasName("idx_na_committee_unit_id");
        });

        modelBuilder.Entity<NonAcademicServiceRecord>(entity =>
        {
            entity.Property(e => e.ServiceToNationalAndInternational)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<List<NonAcademicServiceItem>>(v, (JsonSerializerOptions)null));
            entity.Property(e => e.ServiceToTheUniversity)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<List<NonAcademicServiceItem>>(v, (JsonSerializerOptions)null));

            entity.HasIndex(e => e.PromotionApplicationId)
                .HasName("idx_na_service_application_id");
            entity.HasIndex(e => new { e.ApplicantId, e.PromotionApplicationId })
                .HasName("idx_na_service_applicant_application");
            entity.HasIndex(e => new { e.ApplicantId, e.Status })
                .HasName("idx_na_service_applicant_status");
        });

        modelBuilder.Entity<PerformanceAtWorkRecord>(entity =>
        {
            entity.Property(e => e.AccuracyOnSchedule)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<PerformanceWorkData>(v, (JsonSerializerOptions)null));
            entity.Property(e => e.QualityOfWork)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<PerformanceWorkData>(v, (JsonSerializerOptions)null));
            entity.Property(e => e.PunctualityAndRegularity)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<PerformanceWorkData>(v, (JsonSerializerOptions)null));
            entity.Property(e => e.KnowledgeOfProcedures)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<PerformanceWorkData>(v, (JsonSerializerOptions)null));
            entity.Property(e => e.AbilityToWorkOnOwn)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<PerformanceWorkData>(v, (JsonSerializerOptions)null));
            entity.Property(e => e.AbilityToWorkUnderPressure)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<PerformanceWorkData>(v, (JsonSerializerOptions)null));
            entity.Property(e => e.AdditionalResponsibility)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<PerformanceWorkData>(v, (JsonSerializerOptions)null));
            entity.Property(e => e.HumanRelations)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<PerformanceWorkData>(v, (JsonSerializerOptions)null));
            entity.Property(e => e.InitiativeAndForesight)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<PerformanceWorkData>(v, (JsonSerializerOptions)null));
            entity.Property(e => e.AbilityToInspireAndMotivate)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<PerformanceWorkData>(v, (JsonSerializerOptions)null));

            entity.HasIndex(e => e.PromotionApplicationId)
                .HasName("idx_na_work_application_id");
            entity.HasIndex(e => new { e.ApplicantId, e.PromotionApplicationId })
                .HasName("idx_na_work_applicant_application");
            entity.HasIndex(e => new { e.ApplicantId, e.Status })
                .HasName("idx_na_work_applicant_status");
        });

        modelBuilder.Entity<NonAcademicAssessmentActivity>(entity =>
        {
            entity.Property(e => e.ActivityData)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<NonAcademicActivityData>(v, (JsonSerializerOptions)null));

            entity.HasIndex(e => new { e.ApplicationId, e.CommitteeLevel, e.ActivityType })
                .HasName("idx_na_activity_app_committee_type");
            entity.HasIndex(e => new { e.ApplicationId, e.ActivityType })
                .HasName("idx_na_activity_app_type");
            entity.HasIndex(e => e.ApplicationId)
                .HasName("idx_na_activity_application_id");
            entity.HasIndex(e => e.ApplicantId)
                .HasName("idx_na_activity_applicant_id");
        });
    }
}
