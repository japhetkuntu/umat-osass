import { useState, useEffect, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GraduationCap, BookOpen, Users, Clock, ArrowRight, Lock, Rocket, CheckCircle2, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { academicService } from "@/services/academicService";
import { ApplicationCategoryState } from "@/types/academic";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { HelpTip } from "@/components/common/HelpTip";
import { RequiredDocumentsCard } from "@/components/application/RequiredDocumentsCard";
import { useAuth } from "@/contexts/AuthContext";

const Application = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { eligibility } = useAuth();
  const [academicState, setAcademicState] = useState<ApplicationCategoryState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStartModal, setShowStartModal] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!eligibility?.applicantNextPosition) {
      navigate("/dashboard", { replace: true });
    }
  }, [eligibility, navigate]);

  useEffect(() => {
    const fetchState = async () => {
      setIsLoading(true);
      try {
        const res = await academicService.getApplicationCategoryState();
        if (res.success) {
          setAcademicState(res.data);
        } else {
          toast.error(res.message || "Failed to load application state");
        }
      } catch (error) {
        console.error("Failed to fetch academic state:", error);
        toast.error("An error occurred while loading application data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchState();
  }, []);

  const isActive = (path: string) => location.pathname === path;

  // True once the backend has created an application record
  const applicationStarted = !!(academicState?.applicationId);

  const handleStartApplication = async () => {
    setIsStarting(true);
    try {
      const res = await academicService.startApplication();
      if (res.success) {
        setAcademicState(res.data);
        setShowStartModal(false);
        toast.success("Application started! Fill in each section below.");
      } else {
        toast.error(res.message || "Failed to start application. Please try again.");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  const sections = [
    {
      id: "teaching",
      title: "Teaching",
      description: "Assess your teaching contributions across 10 categories with supporting evidence.",
      icon: GraduationCap,
      status: academicState?.teachingCategoryStatus || "not-started",
      itemCount: academicState?.numberOfRecordsForTeaching || 0,
    },
    {
      id: "publications",
      title: "Publications",
      description: "Add your research publications and propose scores based on the scoring guide.",
      icon: BookOpen,
      status: academicState?.publicationCategoryStatus || "not-started",
      itemCount: academicState?.numberOfRecordsForPublication || 0,
    },
    {
      id: "service",
      title: "Service",
      description: "Record your university, national, and international service contributions.",
      icon: Users,
      status: academicState?.serviceCategoryStatus || "not-started",
      itemCount: academicState?.numberOfRecordsForService || 0,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-20 max-w-5xl mx-auto">
      {/* Header Section */}
      <section className="space-y-3 border-b border-border/30 pb-8 mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          Promotion Application
          <HelpTip tip="Your promotion application is made up of three sections: Teaching, Publications, and Service. Complete all three and submit for committee review. You can save progress at any time." />
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Complete each section below — Teaching, Publications, and Service — with your self-assessment scores and supporting evidence.
        </p>
      </section>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-20 bg-muted rounded-lg animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-4 lg:col-span-3 h-96 bg-muted rounded-lg animate-pulse"></div>
            <div className="md:col-span-8 lg:col-span-9 space-y-6">
              <div className="h-48 bg-muted rounded-lg animate-pulse"></div>
              <div className="h-48 bg-muted rounded-lg animate-pulse"></div>
              <div className="h-48 bg-muted rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Progress Timeline / Steps */}
        <div className="md:col-span-4 lg:col-span-3 space-y-6">
          <div className={cn(
            "card-elevated p-6 space-y-6 sticky top-24",
            !applicationStarted && "opacity-40 pointer-events-none select-none"
          )}>
            <h3 className="font-bold text-lg border-b border-border pb-3 flex items-center gap-1.5">
              Progress
              <HelpTip tip="Each section must be filled in before you can submit. Click any section to start or continue entering your evidence." />
            </h3>
            <div className="space-y-8">
              {sections.map((s, i) => (
                <div key={s.id} className="relative flex gap-4 group cursor-pointer" onClick={() => navigate(`/application/${s.id}`)}>
                  {i < sections.length - 1 && (
                    <div className="absolute left-[11px] top-6 w-[2px] h-[calc(100%+24px)] bg-muted group-hover:bg-primary/20 transition-colors" />
                  )}
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black z-10 transition-all shadow-sm",
                    (s.status === "approved" || s.status === "submitted") ? "bg-success text-white" : "bg-primary text-white"
                  )}>
                    {i + 1}
                  </div>
                  <div>
                    <p className={cn("text-xs font-bold transition-colors", isActive(`/application/${s.id}`) ? "text-primary" : "text-muted-foreground group-hover:text-primary")}>
                      {s.title}
                    </p>
                    <p className="text-[10px] opacity-60 uppercase tracking-tighter font-medium capitalize">
                      {s.status.replace("-", " ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-border mt-4">
              <Button className="w-full bg-secondary hover:bg-secondary/90 text-primary font-bold shadow-lg shadow-secondary/20" onClick={() => navigate("/review")}>
                Preview Submission
              </Button>
            </div>
          </div>
        </div>

        {/* Section Cards */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          <RequiredDocumentsCard applicationStatus={academicState?.applicationStatus} locked={!applicationStarted} />

          {/* Start Application CTA — shown only before the application is started */}
          {!applicationStarted && (
            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 animate-fade-in">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Rocket className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-bold text-foreground text-base">
                  Ready to apply for {eligibility?.applicantNextPosition}?
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Start your application to unlock all three sections. You can save progress and return at any time — nothing is submitted until you explicitly submit.
                </p>
              </div>
              <Button
                size="lg"
                className="shrink-0 font-bold shadow-md shadow-primary/20 px-6"
                onClick={() => setShowStartModal(true)}
              >
                Start Application
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {sections.map((section, index) => (
            <div
              key={section.id}
              className={cn(
                "animate-slide-up group",
                !applicationStarted && "pointer-events-none"
              )}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div
                onClick={() => applicationStarted && navigate(`/application/${section.id}`)}
                className={cn(
                  "border border-border rounded-lg p-8 transition-all bg-card shadow-sm relative overflow-hidden",
                  applicationStarted
                    ? "cursor-pointer hover:border-primary/30"
                    : "opacity-50 cursor-not-allowed select-none"
                )}
              >
                {/* Lock overlay label when not started */}
                {!applicationStarted && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 border border-border shadow-sm">
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground">Start application to unlock</span>
                    </div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className={cn(
                    "p-4 rounded-xl transition-all",
                    applicationStarted ? "bg-primary/5 group-hover:bg-primary group-hover:text-white" : "bg-muted"
                  )}>
                    <section.icon className="w-8 h-8" />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className={cn(
                        "text-xl font-bold transition-colors",
                        applicationStarted ? "text-foreground group-hover:text-primary" : "text-muted-foreground"
                      )}>
                        {section.title}
                      </h2>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">
                          {section.itemCount} Records
                        </span>
                        <div className={cn(
                          "w-10 h-10 rounded-full border border-border flex items-center justify-center transition-all shadow-sm",
                          applicationStarted && "group-hover:bg-primary group-hover:border-primary"
                        )}>
                          {applicationStarted
                            ? <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-all" />
                            : <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                          }
                        </div>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
                      {section.description}
                    </p>

                    <div className="flex items-center gap-4 pt-4">
                      <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden max-w-[200px]">
                        <div
                          className="h-full bg-primary transition-all duration-1000"
                          style={{
                            width: section.status === "in-progress" ? "45%" :
                              (section.status === "approved" || section.status === "submitted") ? "100%" : "0%"
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground capitalize">
                        {section.status.replace("-", " ")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Guidelines Banner */}
          <div className={cn(
            "p-6 bg-muted/40 rounded-xl border border-dashed border-border flex items-center justify-between gap-6",
            !applicationStarted && "opacity-50"
          )}>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-white border border-border flex items-center justify-center shrink-0 shadow-sm">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Auto-saved</p>
                <p className="text-[10px] text-muted-foreground">Your progress is saved automatically. You can return and continue at any time.</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-bold text-primary hover:bg-primary/5"
              onClick={() => navigate("/guidelines")}
            >
              View Guidelines
            </Button>
          </div>
        </div>
      </div>
      )}

      {/* Start Application Confirmation Modal */}
      <Dialog open={showStartModal} onOpenChange={setShowStartModal}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0">
          {/* Hero banner */}
          <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 px-8 pt-8 pb-10 text-white overflow-hidden">
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-white/5" />
            <div className="relative space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">Promotion Application</p>
                <DialogTitle className="text-2xl font-bold text-white leading-tight">
                  Apply for{" "}
                  <span className="text-secondary">{eligibility?.applicantNextPosition}</span>
                </DialogTitle>
              </div>
            </div>
          </div>

          {/* Section chips */}
          <div className="px-8 -mt-4 relative z-10">
            <div className="flex flex-wrap gap-2">
              {[
                { icon: GraduationCap, label: "Teaching" },
                { icon: BookOpen, label: "Publications" },
                { icon: Users, label: "Service" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="px-8 pt-5 pb-6 space-y-3">
            <DialogDescription className="sr-only">Confirm starting your promotion application</DialogDescription>
            {[
              { icon: CheckCircle2, text: "All three sections unlock immediately — fill them in at your own pace." },
              { icon: FileText, text: "Your progress is saved automatically every time you make a change." },
              { icon: Shield, text: <>Nothing reaches any committee until you click <span className="font-semibold text-foreground">Submit Application</span>.</> },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">{text}</p>
              </div>
            ))}
          </div>

          <div className="px-8 pb-7 flex flex-col-reverse sm:flex-row justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowStartModal(false)}
              disabled={isStarting}
              className="sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartApplication}
              disabled={isStarting}
              className="font-bold sm:w-auto shadow-lg shadow-primary/20"
            >
              {isStarting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Starting…
                </>
              ) : (
                <>
                  Start Application
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default memo(Application);
