import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Plus, Info, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PublicationCard, PublicationData } from "@/components/application/PublicationCard";
import { nonAcademicService } from "@/services/nonAcademicService";
import { KnowledgeMaterialIndicator } from "@/types/academic";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const KnowledgeProfessionSection = () => {
  const navigate = useNavigate();
  const { eligibility } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [materials, setMaterials] = useState<PublicationData[]>([]);
  const [indicators, setIndicators] = useState<KnowledgeMaterialIndicator[]>([]);
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stateRes, appStateRes, indicatorsRes] = await Promise.all([
          nonAcademicService.getKnowledgeProfessionState(),
          nonAcademicService.getApplicationCategoryState(),
          nonAcademicService.getKnowledgeMaterialIndicators(),
        ]);

        if (stateRes.success && stateRes.data?.materials) {
          setMaterials(
            stateRes.data.materials.map((m: any) => ({
              id: m.id,
              title: m.title,
              year: m.year,
              publicationTypeId: m.materialTypeId,
              score: m.systemGeneratedScore || 0,
              applicantScore: m.applicantScore ?? null,
              remark: m.remark || "",
              evidence: m.evidence || [],
              newFiles: [],
              isPresented: m.isPresented || false,
              presentationEvidence: m.presentationEvidence || [],
              newPresentationFiles: [],
              removedPresentationEvidence: [],
            }))
          );
        }

        if (appStateRes.success && appStateRes.data) {
          const status = appStateRes.data.applicationStatus?.toLowerCase();
          setIsReadOnly(!eligibility?.applicantNextPosition || (status && status !== "draft" && status !== "returned"));
        }

        if (indicatorsRes.success && indicatorsRes.data) {
          setIndicators(indicatorsRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch knowledge profession data:", error);
        toast.error("Failed to load knowledge & profession data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddMaterial = () => {
    const newMaterial: PublicationData = {
      id: `new-${Math.random().toString(36).substr(2, 9)}`,
      title: "",
      year: new Date().getFullYear(),
      publicationTypeId: "",
      score: 0,
      applicantScore: null,
      remark: "",
      evidence: [],
      newFiles: [],
      isPresented: false,
      presentationEvidence: [],
      newPresentationFiles: [],
      removedPresentationEvidence: [],
    };
    setMaterials((prev) => [newMaterial, ...prev]);
  };

  const handleUpdateMaterial = (updated: PublicationData) => {
    setMaterials((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const formData = new FormData();

      materials.forEach((mat, index) => {
        formData.append(`Materials[${index}].Id`, mat.id.startsWith("new-") ? "" : mat.id);
        formData.append(`Materials[${index}].Title`, mat.title);
        formData.append(`Materials[${index}].Year`, mat.year.toString());
        formData.append(`Materials[${index}].MaterialTypeId`, mat.publicationTypeId);
        formData.append(`Materials[${index}].Score`, (mat.applicantScore || 0).toString());
        formData.append(`Materials[${index}].Remark`, mat.remark || "");
        formData.append(`Materials[${index}].IsPresented`, (mat.isPresented || false).toString());

        (mat.removedPresentationEvidence || []).forEach((key) => {
          formData.append(`Materials[${index}].RemovedPresentationEvidence`, key);
        });
        (mat.newPresentationFiles || []).forEach((file) => {
          formData.append(`Materials[${index}].PresentationEvidence`, file);
        });
        (mat.evidence || []).forEach((ev) => {
          formData.append(`Materials[${index}].EvidenceKeys`, ev);
        });
        (mat.removedDocuments || []).forEach((key) => {
          formData.append(`Materials[${index}].RemovedEvidence`, key);
        });
        (mat.newFiles || []).forEach((file) => {
          formData.append(`Materials[${index}].Evidence`, file);
        });
      });

      const response = await nonAcademicService.updateKnowledgeProfession(formData);
      if (response.success) {
        toast.success("Knowledge & profession materials updated successfully");
        const stateRes = await nonAcademicService.getKnowledgeProfessionState();
        if (stateRes.success && stateRes.data?.materials) {
          setMaterials(
            stateRes.data.materials.map((m: any) => ({
              id: m.id,
              title: m.title,
              year: m.year,
              publicationTypeId: m.materialTypeId,
              score: m.systemGeneratedScore || 0,
              applicantScore: m.applicantScore ?? null,
              remark: m.remark || "",
              evidence: m.evidence || [],
              newFiles: [],
              isPresented: m.isPresented || false,
              presentationEvidence: m.presentationEvidence || [],
              newPresentationFiles: [],
              removedPresentationEvidence: [],
            }))
          );
        }
      } else {
        toast.error(response.message || "Failed to update knowledge & profession materials");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An unexpected error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground text-xs">Loading knowledge & profession data...</p>
      </div>
    );
  }

  const totalSystemScore = materials.reduce((sum, m) => sum + (m.score || 0), 0);
  const totalSelfScore = materials.reduce((sum, m) => sum + (m.applicantScore || 0), 0);

  const getPerformanceLevel = () => {
    if (materials.length === 0) return { label: "No Data", className: "text-muted-foreground", bg: "bg-muted/50" };
    if (totalSelfScore >= 90) return { label: "High", className: "text-secondary-dark", bg: "bg-secondary/10" };
    if (totalSelfScore >= 50) return { label: "Moderate", className: "text-primary", bg: "bg-primary/10" };
    return { label: "Developing", className: "text-muted-foreground", bg: "bg-muted/10" };
  };

  const perf = getPerformanceLevel();

  return (
    <div className="space-y-10 animate-fade-in pb-20 max-w-6xl mx-auto">
      <section className="space-y-6 border-b border-border/50 pb-8">
        <button
          onClick={() => navigate("/application")}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Portfolio
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <span className="text-secondary-dark font-bold text-[10px] uppercase tracking-[0.2em]">Section 2</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Knowledge & Profession</h1>
            <p className="text-muted-foreground text-lg font-light max-w-2xl">
              Document your knowledge outputs including technical reports, manuals, journal articles, and other professional contributions.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-card/50 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm">
            <div className="text-right">
              <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Total Score</p>
              <p className={cn("text-2xl font-bold", perf.className)}>
                {totalSelfScore} <span className="text-xs font-light text-muted-foreground">pts</span>
              </p>
            </div>
            <div className={cn("px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter", perf.bg, perf.className)}>
              {perf.label}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          {!isReadOnly && (
            <Button
              onClick={handleAddMaterial}
              className="w-full h-16 rounded-2xl border-2 border-dashed border-border/50 bg-background/50 hover:bg-primary/5 hover:border-primary/30 text-muted-foreground hover:text-primary group transition-all"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              <span className="font-bold uppercase tracking-widest text-xs">Add Knowledge Material</span>
            </Button>
          )}

          {materials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-bold text-foreground/50">No materials added</h3>
              <p className="text-sm text-muted-foreground mt-2">Add your journals, technical reports, or manuals to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {materials.map((mat, index) => (
                <div key={mat.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <PublicationCard
                    publication={mat}
                    indicators={indicators}
                    onUpdate={handleUpdateMaterial}
                    onDelete={handleDeleteMaterial}
                    isReadOnly={isReadOnly}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="card-elevated p-6 space-y-6">
              <h3 className="font-bold text-lg border-b border-border pb-3">Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Materials</span>
                  <span className="font-bold">{materials.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">System Score</span>
                  <span className="font-medium text-muted-foreground">{totalSystemScore} pts</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-border/50">
                  <span className="text-muted-foreground">Your Proposed Score</span>
                  <span className="font-bold text-primary text-lg">{totalSelfScore} pts</span>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-xl border border-border">
                <div className="flex gap-3">
                  <Info className="w-4 h-4 text-muted-foreground shrink-0" />
                  <p className="text-[10px] leading-relaxed text-muted-foreground">
                    Propose scores based on the scoring guide. Attach evidence for each entry.
                  </p>
                </div>
              </div>

              <Button
                disabled={saving || isReadOnly}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/20"
                onClick={handleSaveAll}
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving Changes...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" />{isReadOnly ? "View Only Mode" : "Save Materials"}</>
                )}
              </Button>
            </div>

            <div className="p-6 bg-muted/30 rounded-2xl border border-dashed border-border space-y-4">
              <h4 className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Tips</h4>
              <ul className="space-y-3 font-light text-xs text-muted-foreground leading-relaxed">
                {[
                  "Include technical reports, manuals, and journal articles in your knowledge materials.",
                  "Attach proof of authorship such as title pages or institutional acknowledgement.",
                  "Refereed journal articles attract higher scores — ensure they are properly identified.",
                ].map((tip, i) => (
                  <li key={i} className="flex gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeProfessionSection;
