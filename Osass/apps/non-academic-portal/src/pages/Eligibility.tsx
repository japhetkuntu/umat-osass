import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, BookOpen, BarChart3, Users, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HelpTip } from "@/components/common/HelpTip";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import { nonAcademicService } from "@/services/nonAcademicService";
import { ApplicationCategoryState } from "@/types/academic";
import { toast } from "sonner";

const Eligibility = () => {
  const navigate = useNavigate();
  const { user, eligibility, logout } = useAuth();
  const [appState, setAppState] = useState<ApplicationCategoryState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplicationState = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await nonAcademicService.getApplicationCategoryState();
        if (res.success) {
          setAppState(res.data);
        } else {
          setError(res.message || "Failed to load eligibility data");
          setAppState(null);
        }
      } catch (error) {
        console.error("Failed to fetch application state:", error);
        setError("An error occurred while loading your eligibility information.");
        setAppState(null);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchApplicationState();
    }
  }, [user]);

  const yearsInRank = eligibility?.totalNumberOfYearsInCurrentPosition || 0;
  const yearsRequired = eligibility?.applicationRequirment?.minimumNumberOfYearsFromLastPromotion || eligibility?.totalNumberOfYearsRequiredInNextPosition || 4;
  const pubsRequired = eligibility?.applicationRequirment?.minimumNumberOfKnowledgeMaterials || 0;
  const refereedRequired = eligibility?.applicationRequirment?.minimumNumberOfRefereedJournal || 0;
  const nextRank = eligibility?.applicationRequirment?.name || eligibility?.applicantNextPosition || "";
  const hasNextPosition = !!nextRank;

  const getPerformanceLevel = (p: string | undefined) => {
    if (!p || p === "Not Started") return 0;
    const label = p.toLowerCase();
    if (label.includes("high") || label.includes("excellent")) return 3;
    if (label.includes("good")) return 2;
    if (label.includes("adequate")) return 1;
    if (label.includes("inadequate")) return 0;
    return 0;
  };

  const getPerformanceStatus = (p: string | undefined) => {
    const level = getPerformanceLevel(p);
    if (level === 3) return "High";
    if (level === 2) return "Good";
    if (level === 1) return "Adequate";
    return "Not Submitted";
  };

  const checkCombination = () => {
    const t = getPerformanceLevel(appState?.performanceAtWorkPerformance);
    const p = getPerformanceLevel(appState?.knowledgeProfessionPerformance);
    const s = getPerformanceLevel(appState?.servicePerformance);
    const levels = [t, p, s].sort((a, b) => b - a);

    if (nextRank.includes("Senior Lecturer")) {
      if (levels[0] >= 3 && levels[1] >= 3 && levels[2] >= 1) return true;
      if (levels[0] >= 2 && levels[1] >= 2 && levels[2] >= 2) return true;
      return false;
    }
    if (nextRank.includes("Associate Professor")) {
      if (levels[0] >= 3 && levels[1] >= 3 && levels[2] >= 2) return true;
      return false;
    }
    if (nextRank.includes("Professor")) {
      if (levels[0] >= 3 && levels[1] >= 3 && levels[2] >= 3) return true;
      return false;
    }
    return false;
  };

  const isOutOfTurnEligible = () => {
    const t = getPerformanceLevel(appState?.performanceAtWorkPerformance);
    const p = getPerformanceLevel(appState?.knowledgeProfessionPerformance);
    const s = getPerformanceLevel(appState?.servicePerformance);
    return p >= 3 && t >= 2 && s >= 2;
  };

  const meetsCombinations = checkCombination();
  const isOutOfTurn = yearsInRank < yearsRequired && isOutOfTurnEligible();
  const meetsYears = yearsInRank >= yearsRequired || isOutOfTurn;
  const meetsPublications = (appState?.numberOfRecordsForKnowledgeProfession || 0) >= pubsRequired;
  const overallEligible = meetsYears && meetsCombinations && meetsPublications;

  if (loading) {
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
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">Loading your eligibility assessment...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
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
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="card-elevated p-8 border-destructive/20 bg-destructive/5">
            <div className="flex items-start gap-4">
              <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Unable to Load Eligibility</h3>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const currentPosition = eligibility?.applicantCurrentPosition || user?.position || "Lecturer";

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
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Page Header */}
        <section className="section-header">
          <h1 className="section-title">Promotion Eligibility Assessment</h1>
          <p className="section-description">
            Review whether you meet the requirements for promotion from {currentPosition} to {nextRank}
          </p>
        </section>

        {/* Overall Eligibility Status */}
        <div className="card-elevated p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded flex-shrink-0 ${
              overallEligible 
                ? "bg-success/15" 
                : "bg-warning/15"
            }`}>
              {overallEligible ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <AlertCircle className="w-5 h-5 text-warning" />
              )}
            </div>
            <div className="flex-1">
              <h2 className={`text-base font-serif font-semibold mb-2 ${
                overallEligible ? "text-success" : "text-foreground"
              }`}>
                {overallEligible ? "Eligible for Promotion" : "Eligibility: Action Required"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {overallEligible 
                  ? `You meet all requirements for promotion to ${nextRank}. You may proceed with your application.`
                  : "You are not yet eligible for promotion. Review the requirements below and update your application as needed."
                }
              </p>
            </div>
          </div>
        </div>

        {/* Requirements Grid */}
        <div className="space-y-6">
          {/* Years in Rank */}
          <div className="card-elevated p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-serif font-semibold text-foreground flex items-center gap-1.5">
                    Years in Current Rank
                    <HelpTip tip="You must serve a minimum number of years in your current rank before you can apply for the next. This counter tracks how long you have held your current position." />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Minimum tenure requirement</p>
                </div>
              </div>
              {meetsYears ? (
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
              )}
            </div>

            <div className="bg-muted/30 rounded p-4 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Years served as {currentPosition}</span>
                <span className="text-lg font-semibold text-foreground">
                  {yearsInRank.toFixed(1)} / {yearsRequired}
                </span>
              </div>
              <div className="w-full h-2 bg-border rounded mt-2">
                <div 
                  className="h-2 bg-primary rounded transition-all"
                  style={{ width: `${Math.min((yearsInRank / yearsRequired) * 100, 100)}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {meetsYears ? (
                isOutOfTurn ? (
                  `You qualify for "Out of Turn" promotion due to exceptional performance.`
                ) : (
                  "You have completed the minimum tenure requirement."
                )
              ) : (
                `You need ${(yearsRequired - yearsInRank).toFixed(1)} more years, unless qualifying for an "Out of Turn" promotion.`
              )}
            </p>
          </div>

          {/* Performance Requirements */}
          <div className="card-elevated p-6">
            <div className="flex items-start gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-serif font-semibold text-foreground flex items-center gap-1.5">
                  Performance Requirements
                  <HelpTip tip="The university requires you to reach a specific combination of performance levels across Performance at Work, Knowledge & Profession, and Service. At least one of the listed combinations must be met." />
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Combination of performance levels required</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Performance at Work */}
                <div className="border border-border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-muted-foreground">PERFORMANCE AT WORK</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      getPerformanceLevel(appState?.performanceAtWorkPerformance) >= 2
                        ? "bg-success/15 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {getPerformanceStatus(appState?.performanceAtWorkPerformance)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {getPerformanceStatus(appState?.performanceAtWorkPerformance) === "Not Submitted" ? "—" : getPerformanceStatus(appState?.performanceAtWorkPerformance)}
                  </p>
                </div>

                {/* Knowledge & Profession */}
                <div className="border border-border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-muted-foreground">KNOWLEDGE & PROFESSION</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      getPerformanceLevel(appState?.knowledgeProfessionPerformance) >= 2
                        ? "bg-success/15 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {getPerformanceStatus(appState?.knowledgeProfessionPerformance)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {getPerformanceStatus(appState?.knowledgeProfessionPerformance) === "Not Submitted" ? "—" : getPerformanceStatus(appState?.knowledgeProfessionPerformance)}
                  </p>
                </div>

                {/* Service */}
                <div className="border border-border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-muted-foreground">SERVICE</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      getPerformanceLevel(appState?.servicePerformance) >= 2
                        ? "bg-success/15 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {getPerformanceStatus(appState?.servicePerformance)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {getPerformanceStatus(appState?.servicePerformance) === "Not Submitted" ? "—" : getPerformanceStatus(appState?.servicePerformance)}
                  </p>
                </div>
              </div>

              <div className="bg-info/5 border border-info/20 rounded p-3 mt-4">
                <p className="text-xs text-foreground font-medium">{nextRank} requires:</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {nextRank.includes("Senior Lecturer") && 
                    "Two High levels + one Adequate level OR three Good levels"}
                  {nextRank.includes("Associate Professor") && 
                    "Two High levels + one Good level"}
                  {nextRank.includes("Professor") && 
                    "Three High levels"}
                </p>
              </div>
            </div>

            <p className={`text-xs mt-3 font-medium ${meetsCombinations ? "text-success" : "text-warning"}`}>
              {meetsCombinations 
                ? "✓ Performance combination requirement met"
                : "Performance combination requirement not yet met"}
            </p>
          </div>

          {/* Knowledge & Profession Requirement */}
          <div className="card-elevated p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-serif font-semibold text-foreground flex items-center gap-1.5">
                    Knowledge & Profession Requirements
                    <HelpTip tip="You must have a minimum number of knowledge materials on record for the target rank. A portion of these must be journal articles. Only materials submitted under your current application are counted." />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Minimum knowledge material records</p>
                </div>
              </div>
              {meetsPublications ? (
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                <span className="text-sm text-muted-foreground">Total knowledge materials</span>
                <span className="text-base font-semibold text-foreground">
                  {appState?.numberOfRecordsForKnowledgeProfession || 0} / {pubsRequired}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded">
                <span className="text-sm text-muted-foreground">Including journals</span>
                <span className="text-sm font-medium text-foreground">min. {refereedRequired}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={() => navigate("/application")}
            disabled={!hasNextPosition || !overallEligible}
          >
            {!hasNextPosition ? (
              "Maximum Position Reached"
            ) : overallEligible ? (
              <>
                Proceed to Application
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              "Complete Your Profile First"
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Eligibility;
