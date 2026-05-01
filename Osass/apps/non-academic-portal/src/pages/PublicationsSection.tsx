import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Plus, Info, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PublicationCard, PublicationData } from "@/components/application/PublicationCard";
import { academicService } from "@/services/academicService";
import { toast } from "sonner";

const PublicationsSection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publications, setPublications] = useState<PublicationData[]>([]);
  const [indicators, setIndicators] = useState<any[]>([]);
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [indicatorsRes, stateRes, appStateRes] = await Promise.all([
          academicService.getPublicationIndicators(),
          academicService.getPublicationState(),
          academicService.getApplicationCategoryState()
        ]);

        if (indicatorsRes.success) {
          setIndicators(indicatorsRes.data);
        }

        if (stateRes.success && stateRes.data.publications) {
          setPublications(stateRes.data.publications.map((p: any) => ({
            ...p,
            isPresented: p.isPresented || false,
            presentationVenue: p.presentationVenue || ""
          })));
        }

        if (appStateRes.success && appStateRes.data) {
          // Allow editing for: No active application OR Draft OR Returned applications
          const status = appStateRes.data.applicationStatus?.toLowerCase();
          setIsReadOnly(status && status !== "draft" && status !== "returned");
        }
      } catch (error) {
        console.error("Failed to fetch publications data:", error);
        toast.error("Failed to load publication data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddPublication = () => {
    const newPublication: PublicationData = {
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
    setPublications((prev) => [newPublication, ...prev]);
  };

  const handleUpdatePublication = (updated: PublicationData) => {
    setPublications((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const handleDeletePublication = (id: string) => {
    setPublications((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // In this specific API, we might need to send them one by one or the whole list
      // Looking at the controller, it takes UpdatePublicationRequest which seems to be for the whole category state
      // Let's check UpdatePublicationRequest.cs again

      const formData = new FormData();
      // The backend expects a list of PublicationData in the request? 
      // Actually, looking at UpdatePublicationRequest.cs (from previous context):
      // public List<UpdatePublicationData> Publications { get; set; }

      // We need to map our publications to the format expected by the backend
      publications.forEach((pub, index) => {
        formData.append(`Publications[${index}].Id`, pub.id.startsWith('new-') ? "" : pub.id);
        formData.append(`Publications[${index}].Title`, pub.title);
        formData.append(`Publications[${index}].Year`, pub.year.toString());
        formData.append(`Publications[${index}].PublicationTypeId`, pub.publicationTypeId);
        formData.append(`Publications[${index}].Score`, (pub.applicantScore || 0).toString());
        formData.append(`Publications[${index}].Remark`, pub.remark || "");
        formData.append(`Publications[${index}].IsPresented`, (pub.isPresented || false).toString());

        if (pub.removedPresentationEvidence) {
          pub.removedPresentationEvidence.forEach((key) => {
            formData.append(`Publications[${index}].RemovedPresentationEvidence`, key);
          });
        }

        if (pub.newPresentationFiles) {
          pub.newPresentationFiles.forEach((file) => {
            formData.append(`Publications[${index}].PresentationEvidence`, file);
          });
        }

        pub.evidence.forEach((ev) => {
          formData.append(`Publications[${index}].EvidenceKeys`, ev);
        });

        if (pub.removedDocuments) {
          pub.removedDocuments.forEach((key) => {
            formData.append(`Publications[${index}].RemovedEvidence`, key);
          });
        }

        if (pub.newFiles) {
          pub.newFiles.forEach((file) => {
            formData.append(`Publications[${index}].Evidence`, file);
          });
        }
      });

      const response = await academicService.updatePublication(formData);
      if (response.success) {
        toast.success("Publications updated successfully");
        // Refresh data to get permanent IDs
        const stateRes = await academicService.getPublicationState();
        if (stateRes.success && stateRes.data.publications) {
          setPublications(stateRes.data.publications.map((p: any) => ({
            ...p,
            isPresented: p.isPresented || false,
            presentationEvidence: p.presentationEvidence || []
          })));
        }
      } else {
        toast.error(response.message || "Failed to update publications");
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
        <p className="text-muted-foreground text-xs">Loading publications...</p>
      </div>
    );
  }

  // Calculate aggregate stats
  const totalSystemScore = publications.reduce((sum, p) => sum + (p.score || 0), 0);
  const totalSelfScore = publications.reduce((sum, p) => sum + (p.applicantScore || 0), 0);

  const getPerformanceLevel = () => {
    if (publications.length === 0) return { label: "No Data", className: "text-muted-foreground", bg: "bg-muted/50" };
    const avg = totalSelfScore / (publications.length || 1);
    if (avg >= 15) return { label: "High", className: "text-secondary-dark", bg: "bg-secondary/10" };
    if (avg >= 10) return { label: "Moderate", className: "text-primary", bg: "bg-primary/10" };
    return { label: "Developing", className: "text-muted-foreground", bg: "bg-muted/10" };
  };

  const perf = getPerformanceLevel();

  return (
    <div className="space-y-10 animate-fade-in pb-20 max-w-6xl mx-auto">
      {/* Navigation & Header */}
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
            <h1 className="text-3xl font-bold text-foreground">Publications</h1>
            <p className="text-muted-foreground text-lg font-light max-w-2xl">
              Document your research output, publications, and scholarly contributions
              across refereed journals, books, and conference proceedings.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-card/50 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm">
            <div className="text-right">
              <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Total Score</p>
              <p className={cn("text-2xl font-bold", perf.className)}>{totalSelfScore} <span className="text-xs font-light text-muted-foreground">pts</span></p>
            </div>
            <div className={cn("px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter", perf.bg, perf.className)}>
              {perf.label}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          {!isReadOnly && (
            <Button
              onClick={handleAddPublication}
              className="w-full h-16 rounded-2xl border-2 border-dashed border-border/50 bg-background/50 hover:bg-primary/5 hover:border-primary/30 text-muted-foreground hover:text-primary group transition-all"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              <span className="font-bold uppercase tracking-widest text-xs">Add Publication</span>
            </Button>
          )}

          {publications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-bold text-foreground/50">No publications added</h3>
              <p className="text-sm text-muted-foreground mt-2">Add your journals, books, or conference papers to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {publications.map((pub, index) => (
                <div key={pub.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <PublicationCard
                    publication={pub}
                    indicators={indicators}
                    onUpdate={handleUpdatePublication}
                    onDelete={handleDeletePublication}
                    isReadOnly={isReadOnly}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="card-elevated p-6 space-y-6">
              <h3 className="font-bold text-lg border-b border-border pb-3">Summary</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Publications</span>
                  <span className="font-bold">{publications.length}</span>
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
                    Propose scores based on the publication scoring guide. Attach evidence for each entry.
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
                    {isReadOnly ? "View Only Mode" : "Save Publications"}
                  </>
                )}
              </Button>
            </div>

            {/* Guidance Section */}
            <div className="p-6 bg-muted/30 rounded-2xl border border-dashed border-border space-y-4">
              <h4 className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Tips</h4>
              <ul className="space-y-3 font-light text-xs text-muted-foreground leading-relaxed">
                <li className="flex gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                  Prioritize high impact factor journals for increased score proposals.
                </li>
                <li className="flex gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                  Ensure DOIs are clearly mentioned in the narrative.
                </li>
                <li className="flex gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                  Attach peer review confirmation for conference papers.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicationsSection;
