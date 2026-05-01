using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Umat.Osass.PostgresDb.Sdk.Entities.AcademicPromotion;

namespace Umat.Osass.PostgresDb.Sdk.ApplicationContexts;

public class AcademicPromotionDbContext : DbContext
{
    public AcademicPromotionDbContext(DbContextOptions<AcademicPromotionDbContext> options) : base(options) { }
    public DbSet<AcademicPromotionApplication> AcademicPromotionApplications => Set<AcademicPromotionApplication>();
    public DbSet<AcademicPromotionCommittee> AcademicPromotionCommittees => Set<AcademicPromotionCommittee>();
    public DbSet<AcademicPromotionPosition> AcademicPromotionPositions => Set<AcademicPromotionPosition>();
    public DbSet<Publication>  Publications => Set<Publication>();
    public DbSet<ServiceRecord> ServiceRecords => Set<ServiceRecord>();
    public DbSet<TeachingRecord>  TeachingRecords => Set<TeachingRecord>();
    public DbSet<AssessmentActivity> AssessmentActivities => Set<AssessmentActivity>();

    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AcademicPromotionPosition>(entity =>
        {
            // 🔧 Convert object to jsonb
            entity.Property(e => e.PerformanceCriteria)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null));
            
        });
        modelBuilder.Entity<AcademicPromotionApplication>(entity =>
        {
            // 🔧 Convert object to jsonb
            entity.Property(e => e.PerformanceCriteria)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null));
            
            // ⚡ Performance indexes for common queries
            entity.HasIndex(e => new { e.ApplicantId, e.IsActive })
                .HasName("idx_application_applicant_active");
            
            entity.HasIndex(e => new { e.ReviewStatus, e.ApplicationStatus })
                .HasName("idx_application_review_status");
            
            entity.HasIndex(e => e.SubmissionDate)
                .HasName("idx_application_submission_date");
            
            entity.HasIndex(e => e.ApplicantId)
                .HasName("idx_application_applicant_id");
            
            entity.HasIndex(e => e.ReviewStatus)
                .HasName("idx_application_review_status_single");
        });
        modelBuilder.Entity<Publication>(entity =>
        {
            // 🔧 Convert object to jsonb
            entity.Property(e => e.Publications)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<List<PublicationData>>(v, (JsonSerializerOptions)null));
            
            // ⚡ Performance indexes for common queries
            entity.HasIndex(e => e.PromotionApplicationId)
                .HasName("idx_publication_application_id");
            
            entity.HasIndex(e => new { e.ApplicantId, e.PromotionApplicationId })
                .HasName("idx_publication_applicant_application");
            
            entity.HasIndex(e => new { e.ApplicantId, e.Status })
                .HasName("idx_publication_applicant_status");
            
        });
        
        modelBuilder.Entity<AcademicPromotionCommittee>(entity =>
        {
            // ⚡ Performance indexes for common queries
            entity.HasIndex(e => new { e.StaffId, e.CommitteeType })
                .HasName("idx_committee_staff_type");
            
            entity.HasIndex(e => new { e.StaffId, e.IsChairperson })
                .HasName("idx_committee_staff_chairperson");
            
            entity.HasIndex(e => e.StaffId)
                .HasName("idx_committee_staff_id");
            
            entity.HasIndex(e => e.CommitteeType)
                .HasName("idx_committee_type");
        });

        
        modelBuilder.Entity<ServiceRecord>(entity =>
        {
            // 🔧 Convert object to jsonb
            entity.Property(e => e.ServiceToNationalAndInternational)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<List<ServiceRecordsData>>(v, (JsonSerializerOptions)null));
            entity.Property(e => e.ServiceToTheUniversity)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<List<ServiceRecordsData>>(v, (JsonSerializerOptions)null));
            
            // ⚡ Performance indexes for common queries
            entity.HasIndex(e => e.PromotionApplicationId)
                .HasName("idx_service_application_id");
            
            entity.HasIndex(e => new { e.ApplicantId, e.PromotionApplicationId })
                .HasName("idx_service_applicant_application");
            
            entity.HasIndex(e => new { e.ApplicantId, e.Status })
                .HasName("idx_service_applicant_status");
        });
        
        modelBuilder.Entity<TeachingRecord>(entity =>
        {
            // 🔧 Convert object to jsonb
            entity.Property(e => e.LectureLoad)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<TeachingData>(v, (JsonSerializerOptions)null));
            entity.Property(e => e.AbilityToAdaptToTeaching)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<TeachingData>(v, (JsonSerializerOptions)null));
            entity.Property(e => e.StudentReactionToAndAssessmentOfTeaching)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<TeachingData>(v, (JsonSerializerOptions)null));
            entity.Property(e => e.RegularityAndPunctuality)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<TeachingData>(v, (JsonSerializerOptions)null));
            entity.Property(e => e.QualityOfLectureMaterial)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<TeachingData>(v, (JsonSerializerOptions)null));
            entity.Property(e => e.PerformanceOfStudentInExam)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<TeachingData>(v, (JsonSerializerOptions)null));
            entity.Property(e => e.AbilityToCompleteSyllabus)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<TeachingData>(v, (JsonSerializerOptions)null));
            entity.Property(e => e.QualityOfExamQuestionAndMarkingScheme)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<TeachingData>(v, (JsonSerializerOptions)null));
            entity.Property(e => e.PunctualityInSettingExamQuestion)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<TeachingData>(v, (JsonSerializerOptions)null));
            entity.Property(e => e.SupervisionOfProjectWorkAndThesis)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<TeachingData>(v, (JsonSerializerOptions)null));
            
            // ⚡ Performance indexes for common queries
            entity.HasIndex(e => e.PromotionApplicationId)
                .HasName("idx_teaching_application_id");
            
            entity.HasIndex(e => new { e.ApplicantId, e.PromotionApplicationId })
                .HasName("idx_teaching_applicant_application");
            
            entity.HasIndex(e => new { e.ApplicantId, e.Status })
                .HasName("idx_teaching_applicant_status");
        });
        
        modelBuilder.Entity<AssessmentActivity>(entity =>
        {
            // 🔧 Convert object to jsonb
            entity.Property(e => e.ActivityData)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<AssessmentActivityData>(v, (JsonSerializerOptions)null));
            
            // ⚡ Performance indexes for common queries
            entity.HasIndex(e => new { e.ApplicationId, e.CommitteeLevel, e.ActivityType })
                .HasName("idx_activity_app_committee_type");
            
            entity.HasIndex(e => new { e.ApplicationId, e.ActivityType })
                .HasName("idx_activity_app_type");
            
            entity.HasIndex(e => e.ApplicationId)
                .HasName("idx_activity_application_id");
            
            entity.HasIndex(e => new { e.PerformedByStaffId, e.ActivityDate })
                .HasName("idx_activity_staff_date");
            
            entity.HasIndex(e => e.ActivityDate)
                .HasName("idx_activity_date");
            
            entity.HasIndex(e => e.ActivityType)
                .HasName("idx_activity_type");
        });

    }
}

