import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp, BarChart3, BookOpen, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import { nonAcademicService } from "@/services/nonAcademicService";
import { ApplicationCategoryState, OverallReview } from "@/types/academic";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Review = () => {
  const navigate = useNavigate();
  const { user, eligibility, logout, refreshProfile } = useAuth();
  const [declaration, setDeclaration] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [appState, setAppState] = useState<ApplicationCategoryState | null>(null);
  const [overallReview, setOverallReview] = useState<OverallReview | null>(null);

  const applicationStatus = (eligibility?.activeApplication?.applicationStatus?.toLowerCase() || "not-started") as any;
  // Allow submission for both draft and returned applications
  const canSubmit = applicationStatus === "draft" || applicationStatus === "returned";

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Refresh profile to get latest eligibility status
        await refreshProfile();
        
        const [stateRes, reviewRes] = await Promise.all([
          nonAcademicService.getApplicationCategoryState(),
          nonAcademicService.getOverallReview()
        ]);

        if (stateRes.success) {
          setAppState(stateRes.data);
        } else {
          toast.error(stateRes.message || "Failed to load application state");
        }

        if (reviewRes.success) {
          setOverallReview(reviewRes.data);
        } else {
          toast.error(reviewRes.message || "Failed to load application review");
        }
      } catch (error) {
        console.error("Failed to fetch review data:", error);
        toast.error("An error occurred while loading review data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, []);

  if (!user) return null;

  const reviewData = {
    performance: {
      level: appState?.performanceAtWorkPerformance || "Not Started",
      avgScore: overallReview?.totalPerformanceAtWorkScore ? `${overallReview.totalPerformanceAtWorkScore.toFixed(1)}/10` : "0/10",
      categoriesCompleted: appState?.numberOfRecordsForPerformanceAtWork || 0,
      description: "Self-assessment across 10 work performance evaluation categories",
    },
    knowledge: {
      level: appState?.knowledgeProfessionPerformance || "Not Started",
      selfTotal: overallReview?.totalKnowledgeProfessionScore || 0,
      count: appState?.numberOfRecordsForKnowledgeProfession || 0,
      description: "Knowledge materials: journals, reports, manuals, and other professional outputs",
    },
    service: {
      level: appState?.servicePerformance || "Not Started",
      totalScore: overallReview?.totalServiceScore || 0,
      totalRecords: appState?.numberOfRecordsForService || 0,
      description: "University governance and community service contributions",
    },
    overallEligibility: eligibility?.isEligibleToApplyForNextPosition ? "Eligible" : (overallReview?.overallPerformance || "Review Pending"),
  };

  const isEligible = eligibility?.isEligibleToApplyForNextPosition;

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleSubmit = async () => {
    if (!declaration || !canSubmit) return;

    if (!appState?.curriculumVitaeFileName) {
      toast.error("Please upload your Curriculum Vitae before submitting");
      navigate("/application");
      return;
    }
    if (!appState?.applicationLetterFileName) {
      toast.error("Please upload your application letter before submitting");
      navigate("/application");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await nonAcademicService.submitApplication();
      if (res.success) {
        toast.success("Application submitted successfully!");
        refreshProfile?.(); // Update auth context state to reflect submission
        navigate("/confirmation");
      } else {
        toast.error(res.message || "Failed to submit application");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred during submission. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const SummaryCard = ({
    title,
    icon: Icon,
    level,
    children,
    id,
  }: {
    title: string;
    icon: React.ElementType;
    level: string;
    children: React.ReactNode;
    id: string;
  }) => {
    const isExpanded = expandedSections.includes(id);

    return (
      <div className="card-elevated overflow-hidden">
        <button
          onClick={() => toggleSection(id)}
          className="w-full p-5 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-foreground">{title}</h3>
              <p className={cn(
                "text-sm font-medium",
                level.toLowerCase().includes("high") || level.toLowerCase().includes("excellent") || level.toLowerCase().includes("good")
                  ? "text-success"
                  : level.toLowerCase().includes("adequate")
                    ? "text-warning"
                    : "text-muted-foreground"
              )}>
                Performance: {level}
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
        {isExpanded && (
          <div className="px-5 pb-5 pt-0 border-t border-border">
            <div className="pt-4">{children}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page-container">
      <Header
        userName={user?.fullName}
        onLogout={() => {
          logout();
          navigate("/login");
        }}
        onChangePassword={() => navigate("/change-password")}
      />

      <main className="content-container">
        {/* Back Button */}
        <button
          onClick={() => navigate("/application")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Application
        </button>

        {/* Header */}
        <div className="mb-8 animate-fade-in space-y-2 border-b border-border/30 pb-6">
          <h1 className="text-3xl font-bold text-foreground">Review Your Application</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Check all sections before submitting your application
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <div className="h-20 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-32 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-32 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-32 bg-muted rounded-lg animate-pulse"></div>
          </div>
        )}

        {!isLoading && (
          <>
        {/* Overall Status */}
        <div className={cn(
          "rounded-xl p-6 mb-8 animate-fade-in border transition-all duration-200",
          "bg-primary/8 border-primary/30"
        )}>
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-2 rounded-lg flex-shrink-0 mt-0.5",
              "bg-primary/15"
            )}>
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold text-primary">
                Ready to Submit
              </p>
              <p className="text-sm text-foreground/70 mt-1">
                {isEligible
                  ? `Your application meets all requirements for promotion to ${eligibility?.applicantNextPosition || 'the next rank'}.`
                  : `You can submit your application for promotion to ${eligibility?.applicantNextPosition || 'the next rank'}. Note: You may have ${eligibility?.remainingNumberOfYearsRequiredInNextPosition?.toFixed(1) || 'some'} years remaining in your current position.`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="space-y-3 mb-10">
          <h2 className="text-lg font-semibold text-foreground mb-4">Submission Summary</h2>
          <SummaryCard
            id="performance"
            title="Performance at Work"
            icon={BarChart3}
            level={reviewData.performance.level}
          >
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {reviewData.performance.description}
              </p>
              <div className="flex gap-4 text-sm">
                <span className="text-foreground">
                  Average Score: <strong>{reviewData.performance.avgScore}</strong>
                </span>
                <span className="text-muted-foreground">
                  {reviewData.performance.categoriesCompleted}/10 categories
                </span>
              </div>
            </div>
          </SummaryCard>

          <SummaryCard
            id="knowledge"
            title="Knowledge & Profession"
            icon={BookOpen}
            level={reviewData.knowledge.level}
          >
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {reviewData.knowledge.description}
              </p>
              <div className="flex gap-4 text-sm">
                <span className="text-foreground">
                  {reviewData.knowledge.count} materials
                </span>
                <span className="text-primary font-medium">
                  Total Score: {reviewData.knowledge.selfTotal} pts
                </span>
              </div>
            </div>
          </SummaryCard>

          <SummaryCard
            id="service"
            title="Service"
            icon={Users}
            level={reviewData.service.level}
          >
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {reviewData.service.description}
              </p>
              <div className="flex gap-4 text-sm">
                <span className="text-foreground">
                  {reviewData.service.totalRecords} records
                </span>
                <span className="text-primary font-medium">
                  Total Score: {reviewData.service.totalScore} pts
                </span>
              </div>
            </div>
          </SummaryCard>
        </div>

        {/* Declaration */}
        <div className="card-elevated p-6 mb-8">
          <div className="flex items-start gap-3">
            <Checkbox
              id="declaration"
              checked={declaration}
              onCheckedChange={(checked) => setDeclaration(checked as boolean)}
              className="mt-0.5"
            />
            <label
              htmlFor="declaration"
              className="text-sm text-foreground cursor-pointer leading-relaxed"
            >
              I confirm that all information provided in this application is accurate and complete
              to the best of my knowledge. I understand that providing false information may result
              in the rejection of my application.
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button variant="outline" onClick={() => navigate("/application")}>
            Edit Application
          </Button>
          <Button
            variant="hero"
            onClick={handleSubmit}
            disabled={!declaration || isSubmitting || !canSubmit}
          >
            {isSubmitting ? "Submitting..." : canSubmit ? (applicationStatus === "returned" ? "Resubmit Application" : "Submit Application") : "Application Submitted"}
          </Button>
        </div>
          </>
        )}
      </main>
    </div>
  );
};

export default memo(Review);
