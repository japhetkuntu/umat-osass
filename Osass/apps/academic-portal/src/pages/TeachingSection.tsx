import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, GraduationCap, Loader2, Save, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TeachingCategoryCard } from "@/components/application/TeachingCategoryCard";
import { academicService } from "@/services/academicService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const TEACHING_CATEGORIES = [
  {
    id: "lectureLoad",
    title: "Lecture Load",
    description: "Volume and consistency of teaching responsibilities across semesters",
  },
  {
    id: "abilityToAdaptToTeaching",
    title: "Ability to Adapt Teaching",
    description: "Flexibility in adjusting teaching methods to student needs and contexts",
  },
  {
    id: "regularityAndPunctuality",
    title: "Regularity and Punctuality",
    description: "Consistency in attendance and timely delivery of lectures",
  },
  {
    id: "qualityOfLectureMaterial",
    title: "Quality of Lecture Material",
    description: "Depth, relevance, and clarity of distributed teaching resources",
  },
  {
    id: "performanceOfStudentInExam",
    title: "Student Exam Performance",
    description: "Analysis of student results and learning outcomes in assessments",
  },
  {
    id: "abilityToCompleteSyllabus",
    title: "Syllabus Coverage",
    description: "Record of successfully covering required course content within timeframes",
  },
  {
    id: "qualityOfExamQuestionAndMarkingScheme",
    title: "Assessment Quality",
    description: "Standard and professionalism of examination papers and marking criteria",
  },
  {
    id: "punctualityInSettingExamQuestion",
    title: "Exam Punctuality",
    description: "Timely submission of examination questions for moderation",
  },
  {
    id: "supervisionOfProjectWorkAndThesis",
    title: "Supervision",
    description: "Guidance of undergraduate and postgraduate research projects",
  },
  {
    id: "studentReactionToAndAssessmentOfTeaching",
    title: "Student Assessment",
    description: "Formal feedback and evaluations provided by students",
  },
];

interface CategoryData {
  id: string | null;
  score: number | null;
  remark: string;
  documents: string[];
  newFiles: File[];
  removedDocuments: string[];
}

const TeachingSection = () => {
  const navigate = useNavigate();
  const { eligibility } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [categoryData, setCategoryData] = useState<Record<string, CategoryData>>(() => {
    const initial: Record<string, CategoryData> = {};
    TEACHING_CATEGORIES.forEach((cat) => {
      initial[cat.id] = { id: null, score: null, remark: "", documents: [], newFiles: [], removedDocuments: [] };
    });
    return initial;
  });

  const fetchTeachingData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await academicService.getTeachingState();
      if (res.success && res.data) {
        const data = res.data;
        const updated: Record<string, CategoryData> = {};
        TEACHING_CATEGORIES.forEach((cat) => {
          const backendData = (data as any)[cat.id];
          updated[cat.id] = {
            id: backendData?.id || null,
            score: backendData?.score ?? null,
            remark: backendData?.remark || "",
            documents: backendData?.evidence || [],
            newFiles: [],
            removedDocuments: [],
          };
        });
        setCategoryData(updated);
      }
    } catch (error) {
      console.error("Failed to fetch teaching data:", error);
      if (!silent) toast({ title: "Error", description: "Failed to load teaching data", variant: "destructive" });
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const fetchApplicationStatus = async () => {
    try {
      const res = await academicService.getApplicationCategoryState();
      if (res.success && res.data) {
        // Allow editing for: No active application OR Draft OR Returned applications
        const status = res.data.applicationStatus?.toLowerCase();
        setIsReadOnly(!eligibility?.applicantNextPosition || (status && status !== "draft" && status !== "returned"));
      }
    } catch (error) {
      console.error("Failed to fetch application status:", error);
    }
  };

  useEffect(() => {
    fetchTeachingData();
    fetchApplicationStatus();
  }, []);

  const handleScoreChange = (id: string, score: number | null) => {
    setCategoryData((prev) => ({
      ...prev,
      [id]: { ...prev[id], score },
    }));
  };

  const handleRemarkChange = (id: string, remark: string) => {
    setCategoryData((prev) => ({
      ...prev,
      [id]: { ...prev[id], remark },
    }));
  };

  const handleDocumentsChange = (id: string, documents: string[], newFiles: File[] = [], removedEvidenceKey?: string) => {
    setCategoryData((prev) => {
      const existingRemoved = prev[id].removedDocuments;
      const updatedRemoved = removedEvidenceKey
        ? [...existingRemoved, removedEvidenceKey]
        : existingRemoved;

      return {
        ...prev,
        [id]: {
          ...prev[id],
          documents,
          newFiles,
          removedDocuments: updatedRemoved
        },
      };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();

      TEACHING_CATEGORIES.forEach((cat) => {
        const data = categoryData[cat.id];

        // Only send categories that have an ID (existing) or have been filled (score or files or removal)
        const hasData = data.id || data.score !== null || data.newFiles.length > 0 || data.removedDocuments.length > 0;

        if (!hasData) return;

        const prefix = cat.id.charAt(0).toUpperCase() + cat.id.slice(1);

        if (data.id) formData.append(`${prefix}.Id`, data.id);
        if (data.score !== null) formData.append(`${prefix}.Score`, data.score.toString());
        if (data.remark) formData.append(`${prefix}.Remark`, data.remark);

        // New files go to .Evidence
        data.newFiles.forEach(file => {
          formData.append(`${prefix}.Evidence`, file);
        });

        // Removed doc keys go to .RemovedEvidence
        data.removedDocuments.forEach(doc => {
          formData.append(`${prefix}.RemovedEvidence`, doc);
        });
      });

      const res = await academicService.updateTeaching(formData);
      if (res.success) {
        toast({
          title: "Progress Saved",
          description: "Your teaching excellence dimension has been updated.",
        });
        await fetchTeachingData(true); // Refresh data silently
      } else {
        toast({
          title: "Save Failed",
          description: res.message || "An error occurred while saving your progress.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Could not connect to the academic server.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Loading teaching data...</p>
      </div>
    );
  }

  const completedCategories = Object.values(categoryData).filter((c) => c.score !== null).length;
  const totalScore = Object.values(categoryData).reduce((sum, c) => sum + (c.score || 0), 0);
  const averageScore = completedCategories > 0 ? (totalScore / completedCategories).toFixed(1) : "—";

  const getPerformanceLevel = () => {
    if (completedCategories === 0) return { label: "Pending", className: "text-muted-foreground", bg: "bg-muted/50" };
    const avg = totalScore / completedCategories;
    if (avg >= 8) return { label: "Excellent", className: "text-success", bg: "bg-success/10" };
    if (avg >= 6) return { label: "Proficient", className: "text-primary", bg: "bg-primary/10" };
    if (avg >= 4) return { label: "Satisfactory", className: "text-warning", bg: "bg-warning/10" };
    return { label: "Developing", className: "text-destructive", bg: "bg-destructive/10" };
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
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <span className="text-secondary-dark font-bold text-[10px] uppercase tracking-[0.2em]">Section 1</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Teaching</h1>
            <p className="text-muted-foreground text-sm max-w-2xl">
              Evaluate your contributions across the ten teaching categories below.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-card/50 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm">
            <div className="text-right">
              <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Average Score</p>
              <p className={cn("text-2xl font-bold", perf.className)}>{averageScore}</p>
            </div>
            <div className={cn("px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter", perf.bg, perf.className)}>
              {perf.label}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-4">
          {TEACHING_CATEGORIES.map((category, index) => (
            <div
              key={category.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <TeachingCategoryCard
                id={category.id}
                title={category.title}
                description={category.description}
                score={categoryData[category.id].score}
                remark={categoryData[category.id].remark}
                documents={categoryData[category.id].documents}
                newFiles={categoryData[category.id].newFiles}
                onScoreChange={handleScoreChange}
                onRemarkChange={handleRemarkChange}
                onDocumentsChange={handleDocumentsChange}
                isReadOnly={isReadOnly}
              />
            </div>
          ))}
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="card-elevated p-6 space-y-6">
              <h3 className="font-bold text-lg border-b border-border pb-3">Progress</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Evaluations Completed</span>
                  <span className="font-bold">{completedCategories} / 10</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                    style={{ width: `${(completedCategories / 10) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <div className="p-4 bg-muted/50 rounded-xl border border-border">
                  <div className="flex gap-3">
                    <Info className="w-4 h-4 text-muted-foreground shrink-0" />
                    <p className="text-[10px] leading-relaxed text-muted-foreground">
                      Scores above 7.0 should be supported by evidence. Attach relevant documents to each category.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  className="w-full bg-success hover:bg-success-glow text-white font-bold h-12 rounded-xl shadow-lg shadow-success/20"
                  onClick={handleSave}
                  disabled={isSaving || isReadOnly}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving Progress...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isReadOnly ? "View Only Mode" : "Save Progress"}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full font-bold h-12 rounded-xl text-muted-foreground"
                  onClick={() => navigate("/application")}
                >
                  Confirm & Continue
                </Button>
              </div>
            </div>

            {/* Tips Section */}
            <div className="p-6 bg-muted/30 rounded-2xl border border-dashed border-border space-y-4">
              <h4 className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Tips</h4>
              <ul className="space-y-3">
                {[
                  "Attach latest student assessment summaries.",
                  "Include screenshots of LMS innovation.",
                  "Curate awards with brief citations."
                ].map((tip, i) => (
                  <li key={i} className="flex gap-3 text-xs text-muted-foreground">
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

export default TeachingSection;
