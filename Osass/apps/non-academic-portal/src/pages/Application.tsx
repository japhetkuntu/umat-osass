import { useState, useEffect, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BarChart3, BookOpen, Users, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nonAcademicService } from "@/services/nonAcademicService";
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
  const [appState, setAppState] = useState<ApplicationCategoryState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!eligibility?.applicantNextPosition) {
      navigate("/dashboard", { replace: true });
    }
  }, [eligibility, navigate]);

  useEffect(() => {
    const fetchState = async () => {
      setIsLoading(true);
      try {
        const res = await nonAcademicService.getApplicationCategoryState();
        if (res.success) {
          setAppState(res.data);
        } else {
          toast.error(res.message || "Failed to load application state");
        }
      } catch (error) {
        console.error("Failed to fetch application state:", error);
        toast.error("An error occurred while loading application data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchState();
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const sections = [
    {
      id: "performance",
      title: "Performance at Work",
      description: "Assess your performance across 10 work categories with supporting evidence.",
      icon: BarChart3,
      status: appState?.performanceAtWorkCategoryStatus || "not-started",
      itemCount: appState?.numberOfRecordsForPerformanceAtWork || 0,
    },
    {
      id: "knowledge",
      title: "Knowledge & Profession",
      description: "Add your knowledge materials and propose scores based on the scoring guide.",
      icon: BookOpen,
      status: appState?.knowledgeProfessionCategoryStatus || "not-started",
      itemCount: appState?.numberOfRecordsForKnowledgeProfession || 0,
    },
    {
      id: "service",
      title: "Service",
      description: "Record your university, national, and international service contributions.",
      icon: Users,
      status: appState?.serviceCategoryStatus || "not-started",
      itemCount: appState?.numberOfRecordsForService || 0,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-20 max-w-5xl mx-auto">
      {/* Header Section */}
      <section className="space-y-3 border-b border-border/30 pb-8 mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          Promotion Application
          <HelpTip tip="Your promotion application is made up of three sections: Performance at Work, Knowledge & Profession, and Service. Complete all three and submit for committee review. You can save progress at any time." />
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Complete each section below — Performance at Work, Knowledge & Profession, and Service — with your self-assessment scores and supporting evidence.
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
          <div className="card-elevated p-6 space-y-6 sticky top-24">
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
          <RequiredDocumentsCard applicationStatus={appState?.applicationStatus} />

          {sections.map((section, index) => (
            <div
              key={section.id}
              className="animate-slide-up group"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div
                onClick={() => navigate(`/application/${section.id}`)}
                className="border border-border rounded-lg p-8 cursor-pointer hover:border-primary/30 transition-all bg-card shadow-sm"
              >
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="p-4 bg-primary/5 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                    <section.icon className="w-8 h-8" />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {section.title}
                      </h2>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">
                          {section.itemCount} Records
                        </span>
                        <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all shadow-sm">
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-all" />
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
          <div className="p-6 bg-muted/40 rounded-xl border border-dashed border-border flex items-center justify-between gap-6">
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
    </div>
  );
};

export default memo(Application);
