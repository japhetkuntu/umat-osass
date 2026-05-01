using System.ComponentModel.DataAnnotations.Schema;

namespace Umat.Osass.PostgresDb.Sdk.Entities.NonAcademicPromotion;

/// <summary>
/// Tracks all assessment activities for the non-academic promotion system (audit trail).
/// </summary>
public class NonAcademicAssessmentActivity : BaseEntity
{
    public string ApplicationId { get; set; }
    public string ApplicantId { get; set; }
    public string ApplicantName { get; set; }

    /// <summary>
    /// The committee level: HOU, AAPSC, UAPC
    /// </summary>
    public string CommitteeLevel { get; set; }

    public string PerformedByStaffId { get; set; }
    public string PerformedByName { get; set; }
    public bool PerformedByIsChairperson { get; set; }

    /// <summary>
    /// Activity type: ScoreSubmitted, ApplicationReturned, ApplicationAdvanced, CommentAdded, ApplicationApproved, ApplicationRejected
    /// </summary>
    public string ActivityType { get; set; }

    public string Description { get; set; }

    /// <summary>
    /// Category affected: PerformanceAtWork, KnowledgeProfession, Service, Overall
    /// </summary>
    public string? CategoryAffected { get; set; }

    public string? PreviousStatus { get; set; }
    public string? NewStatus { get; set; }

    [Column(TypeName = "jsonb")]
    public NonAcademicActivityData? ActivityData { get; set; }

    public DateTime ActivityDate { get; set; } = DateTime.UtcNow;
}

public class NonAcademicActivityData
{
    public double? PreviousScore { get; set; }
    public double? NewScore { get; set; }
    public string? Remarks { get; set; }
    public string? ReturnReason { get; set; }
    public List<string>? AffectedRecordIds { get; set; }
    public Dictionary<string, double>? CategoryScores { get; set; }
}

public static class NonAcademicAssessmentActivityTypes
{
    public const string ApplicationReceived = "ApplicationReceived";
    public const string AssessmentStarted = "AssessmentStarted";
    public const string ScoreSubmitted = "ScoreSubmitted";
    public const string CommentAdded = "CommentAdded";
    public const string ApplicationReturned = "ApplicationReturned";
    public const string ApplicationAdvanced = "ApplicationAdvanced";
    public const string ApplicationApproved = "ApplicationApproved";
    public const string ApplicationRejected = "ApplicationRejected";
    public const string ResubmissionReceived = "ResubmissionReceived";
}
