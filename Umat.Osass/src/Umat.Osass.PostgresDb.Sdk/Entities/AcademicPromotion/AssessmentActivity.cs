using System.ComponentModel.DataAnnotations.Schema;

namespace Umat.Osass.PostgresDb.Sdk.Entities.AcademicPromotion;

/// <summary>
/// Tracks all assessment activities for audit trail and history
/// </summary>
public class AssessmentActivity : BaseEntity
{
    public string ApplicationId { get; set; }
    public string ApplicantId { get; set; }
    public string ApplicantName { get; set; }
    
    /// <summary>
    /// The committee level: DAPC, FAPSC, UAPC
    /// </summary>
    public string CommitteeLevel { get; set; }
    
    /// <summary>
    /// The staff who performed the action
    /// </summary>
    public string PerformedByStaffId { get; set; }
    public string PerformedByName { get; set; }
    public bool PerformedByIsChairperson { get; set; }
    
    /// <summary>
    /// Activity type: ScoreSubmitted, ApplicationReturned, ApplicationAdvanced, CommentAdded
    /// </summary>
    public string ActivityType { get; set; }
    
    /// <summary>
    /// Human-readable description of the activity
    /// </summary>
    public string Description { get; set; }
    
    /// <summary>
    /// Category affected: Teaching, Publication, Service, Overall
    /// </summary>
    public string? CategoryAffected { get; set; }
    
    /// <summary>
    /// Previous status before the activity
    /// </summary>
    public string? PreviousStatus { get; set; }
    
    /// <summary>
    /// New status after the activity
    /// </summary>
    public string? NewStatus { get; set; }
    
    /// <summary>
    /// JSON data containing additional details (scores, remarks, etc.)
    /// </summary>
    [Column(TypeName = "jsonb")]
    public AssessmentActivityData? ActivityData { get; set; }
    
    public DateTime ActivityDate { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Additional data for assessment activities
/// </summary>
public class AssessmentActivityData
{
    public double? PreviousScore { get; set; }
    public double? NewScore { get; set; }
    public string? Remarks { get; set; }
    public string? ReturnReason { get; set; }
    public List<string>? AffectedRecordIds { get; set; }
    public Dictionary<string, double>? CategoryScores { get; set; }
}

/// <summary>
/// Activity types for assessment tracking
/// </summary>
public static class AssessmentActivityTypes
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
