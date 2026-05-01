import { useState, useEffect, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, CheckCircle2, AlertCircle, Clock, FileText, BookOpen, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationStatusBadge } from "@/components/promotion/ApplicationStatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { nonAcademicService } from "@/services/nonAcademicService";
import { ApplicationCategoryState } from "@/types/academic";
import { ApplicationStatus } from "@/types/auth";
import { toast } from "sonner";
import { OnboardingBanner } from "@/components/common/OnboardingBanner";
import { HelpTip } from "@/components/common/HelpTip";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, eligibility, refreshProfile } = useAuth();
  const [appState, setAppState] = useState<ApplicationCategoryState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await refreshProfile();
        
        const res = await nonAcademicService.getApplicationCategoryState();
        if (res.success) {
          setAppState(res.data);
        } else {
          toast.error(res.message || "Failed to load application state");
        }
      } catch (error) {
        console.error("Failed to fetch application state:", error);
        toast.error("An error occurred while loading your data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [location.pathname]);

  if (!user) return null;

  const applicationStatus = (eligibility?.activeApplication?.applicationStatus?.toLowerCase() || "not-started") as ApplicationStatus;
  const isEligible = eligibility?.isEligible || false;
  const hasNextPosition = !!eligibility?.applicantNextPosition;

  const getActionButton = () => {
    if (applicationStatus === "approved") {
      return {
        label: "View Promotion Letter",
        icon: FileText,
        onClick: () => navigate("/promotion-letter"),
        variant: "default" as const,
        color: "text-success"
      };
    } else if (applicationStatus === "submitted") {
      return {
        label: "View Application Status",
        icon: BarChart3,
        onClick: () => navigate("/progress"),
        variant: "default" as const,
        color: "text-info"
      };
    } else if (!hasNextPosition) {
      return {
        label: "Maximum Position Reached",
        icon: FileText,
        onClick: () => {},
        variant: "default" as const,
        color: "text-muted-foreground",
        disabled: true,
      };
    } else {
      return {
        label: applicationStatus === "not-started" ? "Start Application" : "Continue Application",
        icon: FileText,
        onClick: () => navigate("/application"),
        variant: "default" as const,
        color: "text-primary"
      };
    }
  };

  const actionButton = getActionButton();
  const ActionIcon = actionButton.icon;

  return (
    <div className="space-y-8 pb-20">
      <OnboardingBanner />
      {/* Header Section */}
      <section className="border-b border-border pb-8">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Welcome Back
            </p>
            <h1 className="text-3xl font-serif font-semibold text-foreground">
              {user.title ? `${user.title} ` : ''}{user.fullName}
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {eligibility?.applicantCurrentPosition || user.position}
              </p>
              {eligibility?.applicantNextPosition && (
                <p className="text-sm text-muted-foreground">
                  Applying for: <span className="text-primary font-medium">{eligibility.applicantNextPosition}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-muted w-fit">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-xs font-medium text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-64 bg-muted rounded-sm animate-pulse"></div>
            <div className="h-64 bg-muted rounded-sm animate-pulse"></div>
          </div>
          <div className="space-y-8">
            <div className="h-64 bg-muted rounded-sm animate-pulse"></div>
            <div className="h-64 bg-muted rounded-sm animate-pulse"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status Card */}
            <div className="card-elevated p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-serif font-semibold text-foreground flex items-center gap-2">
                  Promotion Application
                  <HelpTip tip="Track your current promotion application. Submit performance at work, knowledge & profession, and service records for committee review." />
                </h2>
                <p className="text-sm text-muted-foreground">Current application status and actions</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-6 border-y border-border">
                {/* Eligibility Status */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {isEligible ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-warning" />
                    )}
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Eligibility</p>
                  </div>
                  <p className="text-sm font-medium text-foreground">{isEligible ? "Met" : "Not Met"}</p>
                </div>

                {/* Application Status */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Application</p>
                  <ApplicationStatusBadge status={applicationStatus} />
                </div>

                {/* Last Updated */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Years in Rank</p>
                  <p className="text-sm font-medium text-foreground">
                    {eligibility?.totalNumberOfYearsInCurrentPosition?.toFixed(1) || "0"} years
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  onClick={actionButton.onClick}
                  className="flex-1"
                  disabled={(actionButton as { disabled?: boolean }).disabled}
                >
                  <ActionIcon className="w-4 h-4 mr-2" />
                  {actionButton.label}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/eligibility")}
                >
                  Check Eligibility
                </Button>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="card-elevated p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-serif font-semibold text-foreground flex items-center gap-2">
                  Performance Summary
                  <HelpTip tip="A summary of your uploaded evidence across performance at work, knowledge & profession, and service — the three categories evaluated for promotion." />
                </h2>
                <p className="text-sm text-muted-foreground">Current assessment across promotion categories</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Performance at Work */}
                <div className="border border-border rounded-sm p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Performance at Work</p>
                  </div>
                  <p className="text-lg font-medium text-foreground">
                    {appState?.performanceAtWorkPerformance || "—"}
                  </p>
                  <button
                    onClick={() => navigate("/application?section=performance")}
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  >
                    Edit <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Knowledge & Profession */}
                <div className="border border-border rounded-sm p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-secondary" />
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Knowledge & Profession</p>
                  </div>
                  <p className="text-lg font-medium text-foreground">
                    {appState?.knowledgeProfessionPerformance || "—"}
                  </p>
                  <button
                    onClick={() => navigate("/application?section=knowledge")}
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  >
                    Edit <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Service */}
                <div className="border border-border rounded-sm p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-success" />
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Service</p>
                  </div>
                  <p className="text-lg font-medium text-foreground">
                    {appState?.servicePerformance || "—"}
                  </p>
                  <button
                    onClick={() => navigate("/application?section=service")}
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  >
                    Edit <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="card-elevated p-6 space-y-4">
              <div className="space-y-2 pb-4 border-b border-border">
                <h3 className="text-sm font-serif font-semibold text-foreground">Resources</h3>
                <p className="text-xs text-muted-foreground">Browse guides and documentation</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => navigate("/guidelines")}
                  className="w-full text-left py-2.5 px-3 rounded text-sm font-medium text-foreground hover:bg-muted transition-colors flex items-center justify-between group"
                >
                  <span>Promotion Guidelines</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button
                  onClick={() => navigate("/score-guide")}
                  className="w-full text-left py-2.5 px-3 rounded text-sm font-medium text-foreground hover:bg-muted transition-colors flex items-center justify-between group"
                >
                  <span>Knowledge & Profession Score Guide</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button
                  onClick={() => navigate("/updates")}
                  className="w-full text-left py-2.5 px-3 rounded text-sm font-medium text-foreground hover:bg-muted transition-colors flex items-center justify-between group"
                >
                  <span>Staff Updates</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </nav>
            </div>

            {/* Recent Updates */}
            <div className="card-elevated p-6 space-y-4">
              <div className="space-y-2 pb-4 border-b border-border">
                <h3 className="text-sm font-serif font-semibold text-foreground">Recent Updates</h3>
              </div>

              <div className="space-y-3">
                <div className="border-l-2 border-primary pl-3 py-1">
                  <p className="text-xs font-medium text-muted-foreground">Latest Announcement</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">Check the Updates page for details</p>
                </div>
              </div>

              <button
                onClick={() => navigate("/updates")}
                className="w-full mt-2 py-2 px-3 border border-border rounded text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                View All Updates
              </button>
            </div>

            {/* Help Section */}
            <div className="card-elevated p-6 space-y-4 border-dashed border-2">
              <div className="space-y-2">
                <h3 className="text-sm font-serif font-semibold text-foreground">Need Help?</h3>
                <p className="text-xs text-muted-foreground">Contact the Non-Academic Promotion Office</p>
              </div>
              <Button
                variant="outline"
                className="w-full text-xs font-medium"
                onClick={() => window.location.href = "mailto:promotion@umat.edu.gh"}
              >
                Email Support
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(Dashboard);
