import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Plus, Building, Globe, Info, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceRecordCard, ServiceRecordData } from "@/components/application/ServiceRecordCard";
import { nonAcademicService } from "@/services/nonAcademicService";
import { ServicePositionIndicator } from "@/types/academic";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type ServiceCategory = "university" | "national-international";

const ServiceSection = () => {
  const navigate = useNavigate();
  const { eligibility } = useAuth();
  const [activeTab, setActiveTab] = useState<ServiceCategory>("university");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [universityRecords, setUniversityRecords] = useState<ServiceRecordData[]>([]);
  const [nationalInternationalRecords, setNationalInternationalRecords] = useState<ServiceRecordData[]>([]);
  const [positions, setPositions] = useState<ServicePositionIndicator[]>([]);
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [positionsRes, stateRes, appStateRes] = await Promise.all([
          nonAcademicService.getServicePositions(),
          nonAcademicService.getServiceState(),
          nonAcademicService.getApplicationCategoryState()
        ]);

        if (positionsRes.success) {
          setPositions(positionsRes.data);
        }

        if (stateRes.success && stateRes.data) {
          const mapToRecord = (s: any): ServiceRecordData => ({
            id: s.id,
            serviceTitle: s.serviceTitle,
            serviceTypeId: s.serviceTypeId,
            role: s.role,
            duration: s.duration,
            score: s.systemGeneratedScore || 0,
            applicantScore: s.score,
            remark: s.remark || "",
            evidence: s.evidence || [],
            newFiles: [],
            removedDocuments: [],
            isActing: s.isActing || false
          });

          setUniversityRecords((stateRes.data.universityCommunity || []).map(mapToRecord));
          setNationalInternationalRecords((stateRes.data.nationalInternationalCommunity || []).map(mapToRecord));
        }

        if (appStateRes.success && appStateRes.data) {
          // Allow editing for: No active application OR Draft OR Returned applications
          const status = appStateRes.data.applicationStatus?.toLowerCase();
          setIsReadOnly(!eligibility?.applicantNextPosition || (status && status !== "draft" && status !== "returned"));
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

  const handleAddRecord = (category: ServiceCategory) => {
    const defaultPos = positions.find(p =>
      category === "university" ? p.serviceType === "University" : p.serviceType !== "University"
    );

    const newRecord: ServiceRecordData = {
      id: `new-${Math.random().toString(36).substr(2, 9)}`,
      serviceTitle: "",
      serviceTypeId: defaultPos?.id || "",
      role: "",
      duration: "",
      score: defaultPos?.score || 0,
      applicantScore: defaultPos?.score || 0,
      remark: "",
      evidence: [],
      newFiles: [],
      removedDocuments: [],
      isActing: false
    };

    if (category === "university") {
      setUniversityRecords((prev) => [newRecord, ...prev]);
    } else {
      setNationalInternationalRecords((prev) => [newRecord, ...prev]);
    }
  };

  const handleUpdateRecord = (updated: ServiceRecordData, category: ServiceCategory) => {
    if (category === "university") {
      setUniversityRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } else {
      setNationalInternationalRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    }
  };

  const handleDeleteRecord = (id: string, category: ServiceCategory) => {
    if (category === "university") {
      setUniversityRecords((prev) => prev.filter((r) => r.id !== id));
    } else {
      setNationalInternationalRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const formData = new FormData();

      universityRecords.forEach((rec, index) => {
        formData.append(`UniversityCommunity[${index}].Id`, rec.id.startsWith('new-') ? "" : rec.id);
        formData.append(`UniversityCommunity[${index}].ServiceTitle`, rec.serviceTitle);
        formData.append(`UniversityCommunity[${index}].ServiceTypeId`, rec.serviceTypeId);
        formData.append(`UniversityCommunity[${index}].Role`, rec.role || "");
        formData.append(`UniversityCommunity[${index}].Duration`, rec.duration || "");
        formData.append(`UniversityCommunity[${index}].Score`, (rec.applicantScore || 0).toString());
        formData.append(`UniversityCommunity[${index}].Remark`, rec.remark || "");
        formData.append(`UniversityCommunity[${index}].IsActing`, (rec.isActing || false).toString());

        if (rec.newFiles) {
          rec.newFiles.forEach((file) => {
            formData.append(`UniversityCommunity[${index}].Evidence`, file);
          });
        }

        if (rec.removedDocuments) {
          rec.removedDocuments.forEach(key => {
            formData.append(`UniversityCommunity[${index}].RemovedEvidence`, key);
          });
        }
      });

      nationalInternationalRecords.forEach((rec, index) => {
        formData.append(`NationalInternationalCommunity[${index}].Id`, rec.id.startsWith('new-') ? "" : rec.id);
        formData.append(`NationalInternationalCommunity[${index}].ServiceTitle`, rec.serviceTitle);
        formData.append(`NationalInternationalCommunity[${index}].ServiceTypeId`, rec.serviceTypeId);
        formData.append(`NationalInternationalCommunity[${index}].Role`, rec.role || "");
        formData.append(`NationalInternationalCommunity[${index}].Duration`, rec.duration || "");
        formData.append(`NationalInternationalCommunity[${index}].Score`, (rec.applicantScore || 0).toString());
        formData.append(`NationalInternationalCommunity[${index}].Remark`, rec.remark || "");
        formData.append(`NationalInternationalCommunity[${index}].IsActing`, (rec.isActing || false).toString());

        if (rec.newFiles) {
          rec.newFiles.forEach((file) => {
            formData.append(`NationalInternationalCommunity[${index}].Evidence`, file);
          });
        }

        if (rec.removedDocuments) {
          rec.removedDocuments.forEach(key => {
            formData.append(`NationalInternationalCommunity[${index}].RemovedEvidence`, key);
          });
        }
      });

      const response = await nonAcademicService.updateService(formData);
      if (response.success) {
        toast.success("Service records updated successfully");
        const stateRes = await nonAcademicService.getServiceState();
        if (stateRes.success && stateRes.data) {
          const mapToRecord = (s: any): ServiceRecordData => ({
            id: s.id,
            serviceTitle: s.serviceTitle,
            serviceTypeId: s.serviceTypeId,
            role: s.role,
            duration: s.duration,
            score: s.systemGeneratedScore || 0,
            applicantScore: s.score,
            remark: s.remark || "",
            evidence: s.evidence || [],
            newFiles: [],
            removedDocuments: [],
            isActing: s.isActing || false
          });

          setUniversityRecords((stateRes.data.universityCommunity || []).map(mapToRecord));
          setNationalInternationalRecords((stateRes.data.nationalInternationalCommunity || []).map(mapToRecord));
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

  const universityScore = universityRecords.reduce((sum, r) => sum + (r.applicantScore || 0), 0);
  const nationalScore = nationalInternationalRecords.reduce((sum, r) => sum + (r.applicantScore || 0), 0);
  const totalScore = universityScore + nationalScore;

  const getPerformanceLevel = (score: number) => {
    if (score >= 40) return { label: "Excellent", className: "text-secondary", bg: "bg-secondary/10" };
    if (score >= 25) return { label: "Good", className: "text-primary", bg: "bg-primary/10" };
    return { label: "Developing", className: "text-muted-foreground", bg: "bg-muted/10" };
  };

  const perf = getPerformanceLevel(totalScore);

  const renderRecordsList = (
    records: ServiceRecordData[],
    category: ServiceCategory,
    icon: React.ReactNode,
    emptyTitle: string
  ) => (
    <div className="space-y-6">
      {!isReadOnly && (
        <Button
          onClick={() => handleAddRecord(category)}
          className="w-full h-16 rounded-2xl border-2 border-dashed border-border/50 bg-background/50 hover:bg-primary/5 hover:border-primary/30 text-muted-foreground hover:text-primary group transition-all"
        >
          <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-xs">Add {category === "university" ? "Internal" : "External"} Record</span>
        </Button>
      )}

      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            {icon}
          </div>
          <h3 className="text-xl font-bold text-foreground/50">{emptyTitle}</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record, index) => (
            <div key={record.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <ServiceRecordCard
                record={record}
                positions={positions}
                onUpdate={(updated) => handleUpdateRecord(updated, category)}
                onDelete={(id) => handleDeleteRecord(id, category)}
                isReadOnly={isReadOnly}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

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
          Back to Portfolio
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
              Record your contributions to the university and external communities.
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
        <div className="lg:col-span-8 space-y-8">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ServiceCategory)} className="w-full">
            <TabsList className="w-full grid grid-cols-2 h-14 bg-muted/30 p-1 rounded-2xl border border-border/50">
              <TabsTrigger
                value="university"
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all font-bold text-xs uppercase tracking-widest"
              >
                <Building className="w-4 h-4 mr-2" />
                Institutional
              </TabsTrigger>
              <TabsTrigger
                value="national-international"
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all font-bold text-xs uppercase tracking-widest"
              >
                <Globe className="w-4 h-4 mr-2" />
                Global & National
              </TabsTrigger>
            </TabsList>

            <TabsContent value="university" className="mt-8 animate-in fade-in slide-in-from-left-4 duration-500">
              {renderRecordsList(
                universityRecords,
                "university",
                <Building className="w-8 h-8 text-muted-foreground/30" />,
                "No internal records documented"
              )}
            </TabsContent>

            <TabsContent value="national-international" className="mt-8 animate-in fade-in slide-in-from-right-4 duration-500">
              {renderRecordsList(
                nationalInternationalRecords,
                "national-international",
                <Globe className="w-8 h-8 text-muted-foreground/30" />,
                "No external records documented"
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="card-elevated p-6 space-y-6">
              <h3 className="font-bold text-lg border-b border-border pb-3">Summary</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Institutional Roles</span>
                  <span className="font-bold">{universityRecords.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">National & International</span>
                  <span className="font-bold">{nationalInternationalRecords.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-border/50">
                  <span className="text-muted-foreground">Your Proposed Score</span>
                  <span className="font-black text-primary text-lg">{totalScore} / 50 pts</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                    style={{ width: `${Math.min(100, (totalScore / 50) * 100)}%` }}
                  />
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
                  Highlight roles that led to policy changes or new department initiatives.
                </li>
                <li className="flex gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                  National service requires appointment letters from recognized state bodies.
                </li>
                <li className="flex gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                  Service to professional bodies count as global outreach if international.
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
