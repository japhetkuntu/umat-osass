import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Eye, Download, FileText, Send, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { ProgressTimeline } from "@/components/promotion/ProgressTimeline";
import { ApplicationStatusBadge } from "@/components/promotion/ApplicationStatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { ReviewStage, ApplicationStatus } from "@/types/auth";
import { academicService } from "@/services/academicService";
import { toast } from "sonner";

const ApplicationProgress = () => {
  const navigate = useNavigate();
  const { user, eligibility, logout, refreshProfile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Refresh eligibility data to get latest application status
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await refreshProfile();
      } catch (error) {
        console.error("Failed to refresh profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (!user) {
    return null;
  }

  const activeApp = eligibility?.activeApplication;
  const applicationStatus = (activeApp?.applicationStatus?.toLowerCase() || "not-started") as ApplicationStatus;
  const currentReviewStage = (activeApp?.applicationReviewStatus || "submitted") as ReviewStage;

  // Build timeline based on current review stage
  const getTimelineSteps = () => {
    const stages: { id: ReviewStage; label: string }[] = [
      { id: "submitted", label: "Application Submitted" },
      { id: "department-review", label: "Department Review" },
      { id: "institutional-review", label: "Institutional Review" },
      { id: "external-assessment", label: "External Assessment" },
      { id: "committee-review", label: "University Appointments & Promotions Committee" },
      { id: "council-decision", label: "Council Decision" },
    ];

    const currentStageIndex = stages.findIndex(
      (s) => s.id === currentReviewStage
    );

    return stages.map((stage, index) => {
      let status: "completed" | "current" | "upcoming" = "upcoming";
      let date: string | undefined;

      if (index < currentStageIndex) {
        status = "completed";
        if (stage.id === "submitted") {
          date = "January 23, 2026"; // Mock date
        }
      } else if (index === currentStageIndex) {
        status = "current";
        if (stage.id === "submitted") {
          date = "January 23, 2026";
        }
      }

      return {
        id: stage.id,
        label: stage.label,
        status,
        date,
      };
    });
  };

  const timelineSteps = getTimelineSteps();

  const handleDownloadPDF = () => {
    // In real app, this would trigger PDF download
    console.log("Downloading PDF...");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSubmitApplication = async () => {
    if (!activeApp) return;

    setSubmitting(true);
    try {
      const res = await academicService.submitApplication();
      if (res.success) {
        toast.success("Application submitted successfully!");
        refreshProfile(); // Refresh to get the new status
      } else {
        toast.error(res.message || "Failed to submit application");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An unexpected error occurred during submission");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <Header
        userName={user.fullName}
        onLogout={handleLogout}
        onChangePassword={() => navigate("/change-password")}
      />

      <main className="content-container">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <h1 className="section-title">Application Progress</h1>
            <ApplicationStatusBadge status={applicationStatus} size="lg" />
          </div>
          <p className="section-subtitle mb-0">
            Track the progress of your promotion application
          </p>
        </div>

        {/* Application Info Card */}
        <div className="card-elevated p-6 mb-6 animate-slide-up">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-foreground mb-1">
                Promotion Application
              </h2>
              <p className="text-sm text-muted-foreground">
                {eligibility?.applicantCurrentPosition || user.position} → {eligibility?.applicantNextPosition || "Next Rank"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Submitted on {activeApp?.applicationStartDate ? new Date(activeApp.applicationStartDate).toLocaleDateString() : "Pending"}
              </p>
            </div>
          </div>
        </div>

        {/* Submission Call to Action for Drafts */}
        {applicationStatus === "draft" && (
          <div className="border border-primary/30 rounded-lg p-6 mb-8 bg-primary/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Ready to Submit?</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your application is complete. Submitting will lock all records for official committee review.
                </p>
                <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-border text-xs text-muted-foreground">
                  <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  Please verify all teaching evidence, publications, and service records are correct before submitting.
                </div>
              </div>

              <Button
                size="lg"
                disabled={submitting}
                onClick={handleSubmitApplication}
                className="h-12 px-8"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Timeline Card */}
        <div className="card-elevated p-8 mb-8 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Review Timeline
          </h2>
          <ProgressTimeline steps={timelineSteps} />
        </div>

        {/* Info Note */}
        <div className="bg-muted rounded-xl p-5 mb-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">What to expect:</strong>
            <br />
            Your application will progress through each review stage. You'll receive email notifications
            as your application advances. The timeline varies depending on committee schedules and
            external assessor availability.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4" style={{ animationDelay: "300ms" }}>
          <Button
            variant="outline"
            onClick={() => navigate("/application/view")}
            className="inline-flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Submitted Application
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF Copy
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ApplicationProgress;
