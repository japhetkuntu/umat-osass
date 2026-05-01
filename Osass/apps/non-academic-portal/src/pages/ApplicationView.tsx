import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Download, GraduationCap, BookOpen, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { ApplicationStatusBadge } from "@/components/promotion/ApplicationStatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { nonAcademicService } from "@/services/nonAcademicService";

const ApplicationView = () => {
  const navigate = useNavigate();
  const { user, logout, eligibility } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    performance: any[];
    knowledge: any[];
    service: { university: any[]; national: any[] };
  }>({
    performance: [],
    knowledge: [],
    service: { university: [], national: [] }
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [perfRes, knowRes, serviceRes] = await Promise.all([
          nonAcademicService.getPerformanceAtWorkState(),
          nonAcademicService.getKnowledgeProfessionState(),
          nonAcademicService.getServiceState()
        ]);

        const performanceCategories = [
          { id: "accuracyOnSchedule", name: "Accuracy on Schedule" },
          { id: "qualityOfWork", name: "Quality of Work" },
          { id: "punctualityAndRegularity", name: "Punctuality & Regularity" },
          { id: "knowledgeOfProcedures", name: "Knowledge of Procedures" },
          { id: "abilityToWorkOnOwn", name: "Ability to Work On Own" },
          { id: "abilityToWorkUnderPressure", name: "Ability to Work Under Pressure" },
          { id: "additionalResponsibility", name: "Additional Responsibility" },
          { id: "humanRelations", name: "Human Relations" },
          { id: "initiativeAndForesight", name: "Initiative & Foresight" },
          { id: "abilityToInspireAndMotivate", name: "Ability to Inspire & Motivate" },
        ];

        const performanceData = perfRes.success ? performanceCategories.map(cat => ({
          name: cat.name,
          score: (perfRes.data as any)[cat.id]?.score || 0,
          remark: (perfRes.data as any)[cat.id]?.remark || ""
        })) : [];

        const knowData = knowRes.success ? (knowRes.data as any).materials || [] : [];

        let universityService: any[] = [];
        let nationalService: any[] = [];

        if (serviceRes.success) {
          serviceRes.data.universityCommunity?.forEach((s: any) => {
            universityService.push({ title: s.serviceTitle, score: s.score });
          });

          serviceRes.data.nationalInternationalCommunity?.forEach((s: any) => {
            nationalService.push({ title: s.serviceTitle, score: s.score });
          });
        }

        setData({
          performance: performanceData,
          knowledge: knowData,
          service: { university: universityService, national: nationalService }
        });
      } catch (error) {
        console.error("Failed to fetch application breakdown:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const activeApp = eligibility?.activeApplication;
  const applicationStatus = (activeApp?.applicationStatus || "submitted") as any;

  const handleDownloadPDF = () => {
    console.log("Downloading PDF...");
  };

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
        <main className="content-container flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Generating application view</p>
        </main>
      </div>
    );
  }

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
          onClick={() => navigate("/progress")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Progress
        </button>

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="section-title">Submitted Application</h1>
              <p className="text-muted-foreground">
                {eligibility?.applicantCurrentPosition || user?.position} → {eligibility?.applicantNextPosition || "Next Rank"}
              </p>
            </div>
            <ApplicationStatusBadge status={applicationStatus} size="lg" />
          </div>

          {/* Read-only notice */}
          <div className="inline-flex items-center gap-2 bg-muted rounded-lg px-4 py-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            This application is read-only and cannot be modified
          </div>
        </div>

        {/* Performance at Work Section */}
        <div className="card-elevated p-6 mb-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Performance at Work</h2>
              <p className="text-sm text-muted-foreground">Assessment scores by category</p>
            </div>
          </div>

          <div className="space-y-3">
            {data.performance.map((category) => (
              <div
                key={category.name}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{category.name}</p>
                  {category.remark && (
                    <p className="text-sm text-muted-foreground mt-0.5 italic">"{category.remark}"</p>
                  )}
                </div>
                <div className="flex-shrink-0 ml-4">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted font-semibold text-foreground">
                    {category.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Knowledge & Profession Section */}
        <div className="card-elevated p-6 mb-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Knowledge & Profession</h2>
              <p className="text-sm text-muted-foreground">{data.knowledge.length} records found</p>
            </div>
          </div>

          <div className="space-y-4">
            {data.knowledge.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-4">No knowledge & profession records submitted.</p>
            ) : data.knowledge.map((item: any, index: number) => (
              <div
                key={index}
                className="bg-muted/50 rounded-lg p-4 border border-border/50"
              >
                <h3 className="font-medium text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Year: {item.year || "N/A"}
                </p>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs uppercase font-bold tracking-tighter">Baseline: </span>
                    <span className="font-medium text-foreground">{item.score}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs uppercase font-bold tracking-tighter">Verified: </span>
                    <span className="font-medium text-primary">{item.applicantScore}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Section */}
        <div className="card-elevated p-6 mb-8 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Service</h2>
              <p className="text-sm text-muted-foreground">Institutional and public contributions</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* University Service */}
            <div>
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 border-b border-border pb-1">
                Institutional Roles
              </h3>
              <div className="space-y-2">
                {data.service.university.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No institutional roles recorded.</p>
                ) : data.service.university.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-foreground text-sm">{service.title}</span>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-muted font-medium text-foreground text-xs">
                      {service.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* National/International Service */}
            <div>
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 border-b border-border pb-1">
                National & International Service
              </h3>
              <div className="space-y-2">
                {data.service.national.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No external service recorded.</p>
                ) : data.service.national.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-foreground text-sm">{service.title}</span>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-muted font-medium text-foreground text-xs">
                      {service.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-center animate-fade-in pb-10">
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 h-12 px-8 rounded-xl font-bold"
          >
            <Lock className="w-4 h-4" />
            Download Application (PDF)
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ApplicationView;
