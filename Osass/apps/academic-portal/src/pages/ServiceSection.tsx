import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Plus, Info, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ServiceRecordCard, ServiceRecordData } from "@/components/application/ServiceRecordCard";
import { academicService } from "@/services/academicService";
import { ServiceCategoryOption, ServiceResponseData } from "@/types/academic";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const mapToRecord = (s: ServiceResponseData): ServiceRecordData => ({
  id: s.id,
  categoryId: s.categoryId,
  servicePositionId: s.servicePositionId,
  committeeName: s.committeeName,
  score: s.systemGeneratedScore || 0,
  remark: s.remark || "",
  evidence: s.evidence || [],
  newFiles: [],
  removedDocuments: [],
  isActing: s.isActing,
});

const ServiceSection = () => {
  const navigate = useNavigate();
  const { eligibility } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<ServiceCategoryOption[]>([]);
  const [records, setRecords] = useState<ServiceRecordData[]>([]);
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, stateRes, appStateRes] = await Promise.all([
          academicService.getServiceCategories(),
          academicService.getServiceState(),
          academicService.getApplicationCategoryState()
        ]);

        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data);
        }

        if (stateRes.success && stateRes.data) {
          setRecords((stateRes.data.services || []).map(mapToRecord));
        }

        if (appStateRes.success && appStateRes.data) {
          // Allow editing for: Draft OR Returned applications only
          const status = appStateRes.data.applicationStatus?.toLowerCase();
          const hasApplication = !!appStateRes.data.applicationId;
          setIsReadOnly(!eligibility?.applicantNextPosition || !hasApplication || (status && status !== "draft" && status !== "returned"));
        }
      } catch (error) {
        console.error("Failed to fetch service data:", error);
        toast.error("Failed to load service data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddRecord = (category: ServiceCategoryOption) => {
    const defaultPos = category.positions[0];

    const newRecord: ServiceRecordData = {
      id: `new-${Math.random().toString(36).substr(2, 9)}`,
      categoryId: category.id,
      servicePositionId: defaultPos?.id || "",
      committeeName: "",
      score: defaultPos
        ? defaultPos.score * (category.requiresDesignation ? category.fullTimeScoreMultiplier : 1)
        : 0,
      remark: "",
      evidence: [],
      newFiles: [],
      removedDocuments: [],
      isActing: category.requiresDesignation ? false : null,
    };

    setRecords((prev) => [newRecord, ...prev]);
  };

  const handleUpdateRecord = (updated: ServiceRecordData) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const formData = new FormData();

      records.forEach((rec, index) => {
        formData.append(`Services[${index}].Id`, rec.id.startsWith('new-') ? "" : rec.id);
        formData.append(`Services[${index}].ServicePositionId`, rec.servicePositionId);
        if (rec.committeeName) {
          formData.append(`Services[${index}].CommitteeName`, rec.committeeName);
        }
        if (rec.isActing !== null && rec.isActing !== undefined) {
          formData.append(`Services[${index}].IsActing`, rec.isActing.toString());
        }
        formData.append(`Services[${index}].Remark`, rec.remark || "");

        if (rec.newFiles) {
          rec.newFiles.forEach((file) => {
            formData.append(`Services[${index}].Evidence`, file);
          });
        }

        if (rec.removedDocuments) {
          rec.removedDocuments.forEach(key => {
            formData.append(`Services[${index}].RemovedEvidence`, key);
          });
        }
      });

      const response = await academicService.updateService(formData);
      if (response.success) {
        toast.success("Service records updated successfully");
        const stateRes = await academicService.getServiceState();
        if (stateRes.success && stateRes.data) {
          setRecords((stateRes.data.services || []).map(mapToRecord));
        }
      } else {
        toast.error(response.message || "Failed to update service records");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An unexpected error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const totalScore = records.reduce((sum, r) => sum + (r.score || 0), 0);

  const getPerformanceLevel = (score: number) => {
    if (score >= 100) return { label: "High", className: "text-secondary", bg: "bg-secondary/10" };
    if (score >= 50) return { label: "Good", className: "text-primary", bg: "bg-primary/10" };
    if (score >= 30) return { label: "Adequate", className: "text-primary", bg: "bg-primary/10" };
    return { label: "Inadequate", className: "text-muted-foreground", bg: "bg-muted/10" };
  };

  const perf = getPerformanceLevel(totalScore);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground text-xs">Loading service records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20 max-w-6xl mx-auto">
      <section className="space-y-6 border-b border-border/50 pb-8">
        <button
          onClick={() => navigate("/application")}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Application
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <span className="text-secondary font-bold text-[10px] uppercase tracking-[0.2em]">Section 3</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Service</h1>
            <p className="text-muted-foreground text-sm max-w-2xl">
              Record your administrative experience, committee service, and contributions to the university and external communities.
            </p>
          </div>

          <div className="flex items-center gap-6 bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-primary/20 shadow-xl shadow-primary/5">
            <div className="text-right">
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mb-1">Total Score</p>
              <div className="flex items-baseline gap-1">
                <p className={cn("text-4xl font-bold", perf.className)}>{totalScore}</p>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">pts</span>
              </div>
            </div>
            <div className="h-10 w-[1px] bg-border/50" />
            <div className={cn("px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border", perf.bg, perf.className, "border-current/20")}>
              {perf.label}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {categories.map((category) => {
            const categoryRecords = records.filter((r) => r.categoryId === category.id);
            return (
              <section key={category.id} className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{category.name}</h2>
                  {category.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{category.description}</p>
                  )}
                </div>

                {!isReadOnly && category.positions.length > 0 && (
                  <Button
                    onClick={() => handleAddRecord(category)}
                    className="w-full h-16 rounded-2xl border-2 border-dashed border-border/50 bg-background/50 hover:bg-primary/5 hover:border-primary/30 text-muted-foreground hover:text-primary group transition-all"
                  >
                    <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    <span className="font-bold uppercase tracking-widest text-xs">Add {category.name} Record</span>
                  </Button>
                )}

                {categoryRecords.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-muted/20 rounded-3xl border border-dashed border-border">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground/50">No records documented</h3>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {categoryRecords.map((record, index) => (
                      <div key={record.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                        <ServiceRecordCard
                          record={record}
                          category={category}
                          onUpdate={handleUpdateRecord}
                          onDelete={handleDeleteRecord}
                          isReadOnly={isReadOnly}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="card-elevated p-6 space-y-6">
              <h3 className="font-bold text-lg border-b border-border pb-3">Summary</h3>

              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{category.name}</span>
                    <span className="font-bold">{records.filter((r) => r.categoryId === category.id).length}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-sm pt-2 border-t border-border/50">
                  <span className="text-muted-foreground">Total Score</span>
                  <span className="font-black text-primary text-lg">{totalScore} pts</span>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-xl border border-border">
                <div className="flex gap-3">
                  <Info className="w-4 h-4 text-muted-foreground shrink-0" />
                  <p className="text-[10px] leading-relaxed text-muted-foreground">
                    Attach appointment letters or official correspondence as evidence for each service role.
                  </p>
                </div>
              </div>

              <Button
                disabled={saving || isReadOnly}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/20"
                onClick={handleSaveAll}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isReadOnly ? "View Only Mode" : "Save Service Records"}
                  </>
                )}
              </Button>
            </div>

            {/* Guidance Section */}
            <div className="p-6 bg-muted/30 rounded-2xl border border-dashed border-border space-y-4">
              <h4 className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Service Guidance</h4>
              <ul className="space-y-3 font-light text-xs text-muted-foreground leading-relaxed">
                <li className="flex gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                  Scores are computed automatically from the position you select — you never need to enter a score.
                </li>
                <li className="flex gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                  Acting/temporary roles receive a reduced share of the position's score — select the correct designation.
                </li>
                <li className="flex gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                  Attach evidence such as appointment letters for every record you add.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSection;
