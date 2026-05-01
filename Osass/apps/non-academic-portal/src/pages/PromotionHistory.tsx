import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Eye,
  Edit,
  Calendar,
  ChevronRight,
  Clock,
  Trophy,
  ExternalLink,
  History,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  BarChart3,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { ApplicationStatusBadge } from "@/components/promotion/ApplicationStatusBadge";
import { HtmlContent } from "@/components/common/HtmlContent";
import { useAuth } from "@/contexts/AuthContext";
import { HistoricalApplication } from "@/types/academic";
import { ApplicationStatus } from "@/types/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { nonAcademicService } from "@/services/nonAcademicService";

const PromotionHistory = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [history, setHistory] = useState<HistoricalApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotionHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await nonAcademicService.getPromotionHistory();
        
        if (response.success && response.data) {
          setHistory(response.data);
        } else {
          setError(response.message || "Failed to load promotion history");
          setHistory([]);
        }
      } catch (error) {
        console.error("Error fetching promotion history:", error);
        setError("An error occurred while loading promotion history.");
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotionHistory();
  }, []);

  const handleApplicationAction = (app: HistoricalApplication) => {
    const status = app.applicationStatus.toLowerCase();
    if (status === "draft" || status === "returned") {
      // Draft and returned applications can be edited
      navigate("/application");
    } else {
      navigate("/application/view");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="page-container min-h-screen bg-slate-50/50">
      <Header
        userName={user?.fullName}
        onLogout={() => {
          logout();
          navigate("/login");
        }}
        onChangePassword={() => navigate("/change-password")}
      />

      <main className="content-container py-8 max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-all mb-8 group"
        >
          <div className="p-1.5 rounded-full bg-white shadow-sm border border-border group-hover:border-primary/30 group-hover:bg-primary/5">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Dashboard
        </button>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Promotion History
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl">
              View your past and current promotion applications.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Applications</p>
            <p className="text-2xl font-bold text-foreground">{history.length}</p>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">Retrieving promotion history...</p>
          </div>
        ) : error ? (
          <div className="card-elevated p-12 text-center border border-destructive/20 bg-destructive/5">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Unable to Load History</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto font-medium">
              {error}
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="px-8 font-semibold"
            >
              Try Again
            </Button>
          </div>
        ) : history.length === 0 ? (
          <div className="card-elevated p-12 text-center border-dashed">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-slate-50 flex items-center justify-center mb-6 shadow-inner">
              <History className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">No Promotion History Yet</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto font-medium">
              You haven't submitted any promotion applications yet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/eligibility")}
                className="px-8 h-12 bg-primary hover:bg-primary-glow text-white shadow-lg shadow-primary/20 font-semibold"
              >
                Check Eligibility
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="px-8 h-12 font-semibold"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative space-y-8 pl-4 sm:pl-8 before:absolute before:left-0 sm:before:left-4 before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-primary/20 before:via-border before:to-transparent">
            {history.map((app, index) => (
              <div
                key={app.id}
                className="relative group animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Timeline Dot */}
                <div className={cn(
                  "absolute -left-[17px] sm:-left-[13px] top-6 w-8 h-8 rounded-full border-4 border-white shadow-md flex items-center justify-center z-10 transition-transform group-hover:scale-110",
                  app.isActive ? "bg-primary text-white" :
                    app.applicationStatus === 'Approved' ? "bg-success text-white" :
                      app.applicationStatus === 'Returned' ? "bg-destructive text-white" :
                        "bg-white text-muted-foreground"
                )}>
                  <Clock className="w-3 h-3" />
                </div>

                <div className={cn(
                  "card-elevated p-0 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 border-l-4",
                  app.isActive ? "border-primary" :
                    app.applicationStatus === 'Approved' ? "border-success" :
                      app.applicationStatus === 'Returned' ? "border-destructive" :
                        "border-slate-200"
                )}>
                  <div className="p-6 sm:p-8 space-y-6 bg-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="px-3 py-1 rounded-md bg-slate-100 text-[10px] font-black text-slate-600 uppercase tracking-wider">
                            ID: {app.id}
                          </div>
                          <div className="px-3 py-1 rounded-md bg-slate-100 text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            Created: {new Date(app.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                          {app.isActive && (
                            <div className="animate-pulse flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 text-[10px] font-black text-primary uppercase tracking-wider">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              Active Application
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {app.promotionPosition}
                          </h2>
                          <div className="flex items-center gap-2 text-muted-foreground font-medium">
                            <span className="text-sm">{app.applicantCurrentPosition}</span>
                            <ArrowRight className="w-4 h-4 opacity-30" />
                            <span className="text-primary text-sm font-bold">{app.promotionPosition}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 shrink-0">
                        <ApplicationStatusBadge
                          status={app.applicationStatus.toLowerCase() as ApplicationStatus}
                          size="lg"
                        />
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {app.reviewStatus}
                        </div>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="pt-4 border-t border-slate-50 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex gap-2">
                        {(app.applicationStatus.toLowerCase() === 'draft' || app.applicationStatus.toLowerCase() === 'returned') ? (
                          <Button
                            onClick={() => handleApplicationAction(app)}
                            className="h-10 px-6 font-black uppercase tracking-widest text-[10px] bg-primary hover:bg-primary-glow text-white shadow-lg shadow-primary/20 transition-all"
                          >
                            <Edit className="w-3.5 h-3.5 mr-2" /> 
                            {app.applicationStatus.toLowerCase() === 'returned' ? 'Edit & Resubmit' : 'Continue Draft'}
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleApplicationAction(app)}
                            className={cn(
                              "h-10 px-6 font-black uppercase tracking-widest text-[10px] transition-all",
                              app.isActive ? "bg-primary hover:bg-primary-glow text-white shadow-lg shadow-primary/20" : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                            )}
                          >
                            <Eye className="w-3.5 h-3.5 mr-2" /> View Details
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          onClick={() => toggleExpand(app.id)}
                          className="h-10 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                        >
                          {expandedId === app.id ? (
                            <><ChevronUp className="w-4 h-4 mr-2" /> Hide Insights</>
                          ) : (
                            <><ChevronDown className="w-4 h-4 mr-2" /> Show Insights</>
                          )}
                        </Button>
                      </div>

                      {app.applicationStatus === 'Approved' && (
                        <Button 
                          onClick={() => navigate(`/promotion-letter/${app.id}`)}
                          variant="outline" 
                          size="sm" 
                          className="h-10 border-success/20 text-success hover:bg-success/5 hover:border-success/30 font-bold uppercase tracking-widest text-[10px]"
                        >
                          <Download className="w-3.5 h-3.5 mr-2" /> Promotion Letter
                        </Button>
                      )}
                    </div>

                    {/* Approved: Celebration Banner */}
                    {app.applicationStatus === 'Approved' && (
                      <div className="mt-6 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 animate-in fade-in duration-500">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-emerald-100 shrink-0">
                            <Trophy className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-black text-emerald-900 text-sm uppercase tracking-widest mb-1">
                              Promotion Approved!
                            </h4>
                            <p className="text-emerald-700 font-medium mb-3">
                              Congratulations! Your promotion to <strong>{app.promotionPosition}</strong> has been approved by the University Non-Academic Promotion Committee (UAPC).
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-xs">
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                                <TrendingUp className="w-3.5 h-3.5" />
                                New Position: {app.promotionPosition}
                              </div>
                              {app.reviewStatus === 'Council Approved' && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                                  <Calendar className="w-3.5 h-3.5" />
                                  Effective: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Returned: Action Required Banner */}
                    {app.applicationStatus.toLowerCase() === 'returned' && (
                      <div className="mt-6 p-6 rounded-2xl bg-amber-50 border border-amber-200 animate-in fade-in duration-500">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-amber-100 shrink-0">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-black text-amber-900 text-sm uppercase tracking-widest mb-1">
                              Action Required
                            </h4>
                            <p className="text-amber-700 font-medium mb-3">
                              Your application has been returned for updates. Please review the feedback below and make the necessary changes before resubmitting.
                            </p>
                            {app.feedback && (
                              <div className="p-4 rounded-xl bg-white border border-amber-200 mb-4">
                                <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  Committee Feedback
                                </p>
                                <div className="text-sm text-amber-900 font-medium leading-relaxed [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:ml-4 [&_strong]:font-bold [&_em]:italic">
                                  <HtmlContent html={app.feedback} />
                                </div>
                              </div>
                            )}
                            <Button
                              onClick={() => navigate("/application")}
                              className="bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase tracking-widest text-[10px] h-10 px-6"
                            >
                              <Edit className="w-3.5 h-3.5 mr-2" />
                              Edit Application
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expanded Content */}
                    {expandedId === app.id && (
                      <div className="pt-6 animate-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-3.5 h-3.5 text-primary" />
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Performance at Work</span>
                            </div>
                            <div className="text-xl font-black text-foreground">{app.performance?.performanceAtWork || "—"}</div>
                          </div>
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-3.5 h-3.5 text-secondary" />
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Knowledge & Profession</span>
                            </div>
                            <div className="text-xl font-black text-foreground">{app.performance?.knowledgeProfession || "—"}</div>
                          </div>
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-3.5 h-3.5 text-info" />
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Service Performance</span>
                            </div>
                            <div className="text-xl font-black text-foreground">{app.performance?.service || "—"}</div>
                          </div>
                        </div>

                        {app.feedback && (
                          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 flex gap-4">
                            <div className="p-2.5 rounded-xl bg-white shadow-sm shrink-0">
                              <MessageSquare className="w-4 h-4 text-amber-600" />
                            </div>
                            <div className="space-y-1 flex-1">
                              <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Reviewer Feedback</p>
                              <div className="text-sm text-amber-900/80 font-medium leading-relaxed [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:ml-3 [&_strong]:font-bold [&_em]:italic">
                                <HtmlContent html={app.feedback} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Informational Cards */}
        {!loading && history.length > 0 && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: "500ms" }}>
            <div className="p-8 rounded-xl bg-white border border-border shadow-sm flex items-start gap-5">
              <div className="p-4 rounded-xl bg-primary/5 text-primary">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-foreground text-sm">Note</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Submitted and approved records are locked and cannot be modified. Only applications in Draft or Returned status can be edited.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PromotionHistory;
