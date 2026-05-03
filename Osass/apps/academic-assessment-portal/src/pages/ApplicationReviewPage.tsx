import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import assessmentApi from "@/services/assessmentApi";
import { getEffectivePublicationScore } from "@/lib/publicationScoring";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RichTextEditor } from "@/components/common/RichTextEditor";
import { HtmlContent } from "@/components/common/HtmlContent";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  User,
  GraduationCap,
  BookOpen,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  MinusCircle,
  Send,
  RotateCcw,
  ArrowRight,
  History,
  MessageSquare,
  FileText,
  Save,
  Eye,
  Download,
  ExternalLink,
  Award,
  TrendingUp,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CategoryScore, RecordScore, PromotionValidationResponse } from "@/types/assessment";
import { FilePreviewModal } from "@/components/common/FilePreviewModal";

// Moved outside to prevent re-creation on every render (fixes input focus loss)
const ScoreInputPanel = ({
  currentScore,
  maxScore,
  onScoreChange,
  remarks,
  onRemarksChange,
  label = "Your Assessment",
  committeeType = "DAPC",
}: {
  currentScore?: number;
  maxScore?: number;
  onScoreChange: (score: number) => void;
  remarks?: string;
  onRemarksChange: (remarks: string) => void;
  label?: string;
  committeeType?: string;
}) => {
  const committeeColors = {
    DAPC: { bg: 'from-blue-500 to-blue-600', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' },
    FAPSC: { bg: 'from-purple-500 to-purple-600', text: 'text-purple-600', border: 'border-purple-200', light: 'bg-purple-50' },
    UAPC: { bg: 'from-emerald-500 to-emerald-600', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50' },
  };
  const colors = committeeColors[committeeType as keyof typeof committeeColors] || committeeColors.DAPC;

  return (
    <div className={`mt-4 p-4 rounded-xl border-2 ${colors.border} ${colors.light} dark:bg-opacity-20`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${colors.bg}`} />
        <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
          {label} ({committeeType})
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <span>Score</span>
            {maxScore && (
              <span className="text-xs font-normal text-muted-foreground">(max: {maxScore})</span>
            )}
          </Label>
          <div className="relative">
            <Input
              type="number"
              step="0.5"
              min="0"
              max={maxScore}
              placeholder="0.0"
              value={currentScore ?? ""}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                  onScoreChange(Math.min(value, maxScore || Infinity));
                } else if (e.target.value === "") {
                  onScoreChange(0);
                }
              }}
              className={`text-lg font-bold h-12 pr-12 ${colors.border} focus:ring-2 focus:ring-offset-1`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
              pts
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Remarks</Label>
          <Input
            placeholder="Add assessment remarks..."
            value={remarks || ""}
            onChange={(e) => onRemarksChange(e.target.value)}
            className={`h-12 ${colors.border}`}
          />
        </div>
      </div>
    </div>
  );
};

export default function ApplicationReviewPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // State for scores
  const [teachingScores, setTeachingScores] = useState<Record<string, CategoryScore>>({});
  const [publicationScores, setPublicationScores] = useState<Record<string, RecordScore>>({});
  const [serviceScores, setServiceScores] = useState<Record<string, RecordScore>>({});
  const [overallRemarks, setOverallRemarks] = useState("");
  
  // Dialog states
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [advanceDialogOpen, setAdvanceDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [uapcReturnDialogOpen, setUapcReturnDialogOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnDetails, setReturnDetails] = useState("");
  const [advanceRecommendation, setAdvanceRecommendation] = useState("");
  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [uapcReturnRemarks, setUapcReturnRemarks] = useState("");
  
  // Validation state
  const [validationData, setValidationData] = useState<PromotionValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // File preview state
  const [previewFile, setPreviewFile] = useState<{ url: string; fileName: string } | null>(null);

  const { data: application, isLoading, error } = useQuery({
    queryKey: ["application-assessment", applicationId],
    queryFn: async () => {
      const response = await assessmentApi.getApplicationForAssessment(applicationId!);
      if (response.code >= 200 && response.code < 300 && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch application");
    },
    enabled: !!applicationId,
  });

  // Determine current user's committee access
  const currentCommittee = user?.committees.find((c) => {
    const reviewStatusMap: Record<string, string> = {
      DAPC: "Department Review",
      FAPSC: "Faculty Review",
      UAPC: "UAPC Review",
    };
    return reviewStatusMap[c.committeeType] === application?.reviewStatus;
  });

  // If no match by review status, check if user is chairperson in any relevant committee
  // This handles cases where application status is loading or in transition
  const chairpersonFallback = !currentCommittee && user?.committees.find((c) => 
    c.isChairperson && (c.committeeType === "DAPC" || c.committeeType === "FAPSC" || c.committeeType === "UAPC")
  );

  const effectiveCommittee = currentCommittee || chairpersonFallback;
  // Permissions are based on currentCommittee (reviewStatus match) only — not the fallback
  const isActiveChairperson = currentCommittee?.isChairperson || false;
  const isPending = application?.applicationStatus === "Submitted";
  const canAct = isActiveChairperson && isPending;
  const canSubmitScores = canAct;
  const canAdvanceOrReturn = canAct;
  // isUAPC uses currentCommittee so button type reflects the currently active committee
  const isUAPC = currentCommittee?.committeeType === "UAPC";

  // Fetch validation when approve dialog opens
  useEffect(() => {
    if (approveDialogOpen && isUAPC && applicationId) {
      setIsValidating(true);
      setValidationError(null);
      assessmentApi.validateForPromotion(applicationId)
        .then((response) => {
          if (response.code >= 200 && response.code < 300 && response.data) {
            setValidationData(response.data);
          } else {
            setValidationError(response.message || "Failed to validate application");
          }
        })
        .catch((error) => {
          setValidationError(error.message || "Failed to validate application");
        })
        .finally(() => {
          setIsValidating(false);
        });
    }
  }, [approveDialogOpen, isUAPC, applicationId]);

  // Mutations
  const submitScoresMutation = useMutation({
    mutationFn: async () => {
      // Validate application status before submission
      if (!isPending) {
        throw new Error("Application is not pending and cannot be assessed");
      }
      const request = {
        applicationId: applicationId!,
        teachingScores: Object.keys(teachingScores).length > 0 ? {
          lectureLoad: teachingScores.lectureLoad,
          abilityToAdaptToTeaching: teachingScores.abilityToAdaptToTeaching,
          regularityAndPunctuality: teachingScores.regularityAndPunctuality,
          qualityOfLectureMaterial: teachingScores.qualityOfLectureMaterial,
          performanceOfStudentInExam: teachingScores.performanceOfStudentInExam,
          abilityToCompleteSyllabus: teachingScores.abilityToCompleteSyllabus,
          qualityOfExamQuestionAndMarkingScheme: teachingScores.qualityOfExamQuestionAndMarkingScheme,
          punctualityInSettingExamQuestion: teachingScores.punctualityInSettingExamQuestion,
          supervisionOfProjectWorkAndThesis: teachingScores.supervisionOfProjectWorkAndThesis,
          studentReactionToAndAssessmentOfTeaching: teachingScores.studentReactionToAndAssessmentOfTeaching,
        } : undefined,
        publicationScores: Object.values(publicationScores),
        serviceScores: Object.values(serviceScores),
        overallRemarks,
      };
      const response = await assessmentApi.submitScores(request);
      if (response.code < 200 || response.code >= 300) {
        throw new Error(response.message || "Failed to submit scores");
      }
      return response;
    },
    onSuccess: () => {
      toast.success("Assessment scores submitted successfully");
      // Immediately refetch to show updates in real-time
      queryClient.invalidateQueries({ queryKey: ["application-assessment", applicationId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const returnMutation = useMutation({
    mutationFn: async () => {
      // Validate application status before submission
      if (!isPending) {
        throw new Error("Application is not pending and cannot be returned");
      }
      const response = await assessmentApi.returnApplication({
        applicationId: applicationId!,
        returnReason,
        detailedComments: returnDetails,
      });
      if (response.code < 200 || response.code >= 300) {
        throw new Error(response.message || "Failed to return application");
      }
      return response;
    },
    onSuccess: () => {
      toast.success("Application returned to applicant");
      setReturnDialogOpen(false);
      // Immediately refetch current application to show updates
      queryClient.invalidateQueries({ queryKey: ["application-assessment", applicationId] });
      // Invalidate dashboard queries for when user navigates back
      queryClient.invalidateQueries({ queryKey: ["assessment-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["pending-applications"] });
      // Navigate back after a short delay so user sees the refresh
      setTimeout(() => navigate(-1), 2000);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const advanceMutation = useMutation({
    mutationFn: async () => {
      // Validate application status before submission
      if (!isPending) {
        throw new Error("Application is not pending and cannot be advanced");
      }
      const response = await assessmentApi.advanceApplication({
        applicationId: applicationId!,
        recommendation: advanceRecommendation,
      });
      if (response.code < 200 || response.code >= 300) {
        throw new Error(response.message || "Failed to advance application");
      }
      return response;
    },
    onSuccess: () => {
      toast.success("Application advanced to next stage");
      setAdvanceDialogOpen(false);
      // Immediately refetch current application to show updates
      queryClient.invalidateQueries({ queryKey: ["application-assessment", applicationId] });
      // Invalidate dashboard queries for when user navigates back
      queryClient.invalidateQueries({ queryKey: ["assessment-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["pending-applications"] });
      // Navigate back after a short delay so user sees the refresh
      setTimeout(() => navigate(-1), 2000);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // UAPC Final Decision Mutations
  const approveMutation = useMutation({
    mutationFn: async () => {
      // Validate application status before submission
      if (!isPending) {
        throw new Error("Application is not pending and cannot be approved");
      }
      const response = await assessmentApi.approveApplication(applicationId!, approvalRemarks);
      if (response.code < 200 || response.code >= 300) {
        throw new Error(response.message || "Failed to approve application");
      }
      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || `Promotion approved! ${application?.applicantName} is now ${application?.applyingForPosition}`);
      setApproveDialogOpen(false);
      // Immediately refetch current application to show updates
      queryClient.invalidateQueries({ queryKey: ["application-assessment", applicationId] });
      // Invalidate dashboard queries for when user navigates back
      queryClient.invalidateQueries({ queryKey: ["assessment-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["pending-applications"] });
      // Navigate back after a short delay so user sees the refresh
      setTimeout(() => navigate(-1), 2000);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const uapcReturnMutation = useMutation({
    mutationFn: async () => {
      // Validate application status before submission
      if (!isPending) {
        throw new Error("Application is not pending and cannot be rejected");
      }
      const response = await assessmentApi.rejectApplication(applicationId!, uapcReturnRemarks);
      if (response.code < 200 || response.code >= 300) {
        throw new Error(response.message || "Failed to return application");
      }
      return response;
    },
    onSuccess: () => {
      toast.success("Application returned to applicant for updates");
      setUapcReturnDialogOpen(false);
      // Immediately refetch current application to show updates
      queryClient.invalidateQueries({ queryKey: ["application-assessment", applicationId] });
      // Invalidate dashboard queries for when user navigates back
      queryClient.invalidateQueries({ queryKey: ["assessment-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["pending-applications"] });
      // Navigate back after a short delay so user sees the refresh
      setTimeout(() => navigate(-1), 2000);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const getPerformanceBadge = (performance?: string) => {
    if (!performance) return null;
    const variants: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
      High: "success",
      Good: "success",
      Adequate: "warning",
      InAdequate: "destructive",
    };
    return <Badge variant={variants[performance] || "secondary"}>{performance}</Badge>;
  };

  // Score calculation helpers - compute totals from individual records
  const calculateTeachingTotals = () => {
    const categories = application?.teaching?.categories || [];
    return {
      self: categories.reduce((sum, c) => sum + (c.applicantScore || 0), 0),
      dapc: categories.reduce((sum, c) => sum + (c.dapcScore || 0), 0),
      fapsc: categories.reduce((sum, c) => sum + (c.fapcScore || 0), 0),
      uapc: categories.reduce((sum, c) => sum + (c.uapcScore || 0), 0),
    };
  };

  const calculatePublicationTotals = () => {
    const records = application?.publications?.records || [];
    return {
      self: records.reduce((sum, r) => {
        // Use applicant score if provided, otherwise use system score with presentation bonus
        const score = r.applicantScore ?? getEffectivePublicationScore(r.systemGeneratedScore, r.isPresented);
        return sum + (score || 0);
      }, 0),
      dapc: records.reduce((sum, r) => sum + (r.dapcScore || 0), 0),
      fapsc: records.reduce((sum, r) => sum + (r.fapcScore || 0), 0),
      uapc: records.reduce((sum, r) => sum + (r.uapcScore || 0), 0),
    };
  };

  const calculateServiceTotals = () => {
    const university = application?.services?.universityService || [];
    const national = application?.services?.nationalInternationalService || [];
    const all = [...university, ...national];
    return {
      self: all.reduce((sum, r) => sum + (r.applicantScore || r.systemGeneratedScore || 0), 0),
      dapc: all.reduce((sum, r) => sum + (r.dapcScore || 0), 0),
      fapsc: all.reduce((sum, r) => sum + (r.fapcScore || 0), 0),
      uapc: all.reduce((sum, r) => sum + (r.uapcScore || 0), 0),
    };
  };

  // Performance cell component with total scores
  const PerformanceCell = ({ 
    label, 
    value, 
    score,
    color, 
    isFinal = false 
  }: { 
    label: string; 
    value?: string; 
    score?: number;
    color: 'slate' | 'blue' | 'purple' | 'emerald'; 
    isFinal?: boolean;
  }) => {
    const getPerformanceColor = (perf?: string) => {
      if (!perf) return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
      const colors: Record<string, string> = {
        High: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700',
        Good: 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700',
        Adequate: 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700',
        InAdequate: 'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700',
      };
      return colors[perf] || 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    };

    const getTextColor = (perf?: string) => {
      if (!perf) return 'text-muted-foreground';
      const colors: Record<string, string> = {
        High: 'text-emerald-700 dark:text-emerald-300',
        Good: 'text-blue-700 dark:text-blue-300',
        Adequate: 'text-amber-700 dark:text-amber-300',
        InAdequate: 'text-red-700 dark:text-red-300',
      };
      return colors[perf] || 'text-foreground';
    };

    const labelColors: Record<string, string> = {
      slate: 'text-slate-500',
      blue: 'text-blue-600 dark:text-blue-400',
      purple: 'text-purple-600 dark:text-purple-400',
      emerald: 'text-emerald-600 dark:text-emerald-400',
    };

    return (
      <div className={`text-center rounded-lg border p-2 transition-all ${getPerformanceColor(value)} ${isFinal && value ? 'ring-2 ring-emerald-400/50 ring-offset-1' : ''}`}>
        <p className={`text-[9px] uppercase tracking-wider font-bold mb-0.5 ${labelColors[color]}`}>
          {label}
        </p>
        {score !== undefined && score > 0 ? (
          <p className={`text-sm font-bold ${getTextColor(value)}`}>
            {score.toFixed(1)}
          </p>
        ) : null}
        <p className={`text-[10px] font-medium truncate ${getTextColor(value)}`}>
          {value || '—'}
        </p>
      </div>
    );
  };

  // Helper to get current committee type
  const getCurrentCommitteeType = () => effectiveCommittee?.committeeType || "DAPC";

  // Helper to determine which previous scores to show based on current committee
  const shouldShowDapcScores = () => {
    const committee = getCurrentCommitteeType();
    return committee === "FAPSC" || committee === "UAPC";
  };

  const shouldShowFapcScores = () => {
    const committee = getCurrentCommitteeType();
    return committee === "UAPC";
  };

  // Elegant Score Breakdown Component - shows all committee scores in a beautiful timeline
  const ScoreBreakdown = ({
    applicantScore,
    dapcScore,
    dapcRemarks,
    fapcScore,
    fapcRemarks,
    uapcScore,
    uapcRemarks,
    systemScore,
    compact = false,
  }: {
    applicantScore?: number;
    dapcScore?: number;
    dapcRemarks?: string;
    fapcScore?: number;
    fapcRemarks?: string;
    uapcScore?: number;
    uapcRemarks?: string;
    systemScore?: number;
    compact?: boolean;
  }) => {
    const scores = [
      { 
        label: 'Applicant', 
        abbrev: 'Self',
        score: applicantScore ?? systemScore, 
        remarks: null,
        color: 'slate',
        bgClass: 'bg-slate-100 dark:bg-slate-800',
        textClass: 'text-slate-700 dark:text-slate-300',
        borderClass: 'border-slate-200 dark:border-slate-700',
        dotClass: 'bg-slate-400',
      },
      { 
        label: 'DAPC', 
        abbrev: 'DAPC',
        score: dapcScore, 
        remarks: dapcRemarks,
        color: 'blue',
        bgClass: 'bg-blue-50 dark:bg-blue-900/30',
        textClass: 'text-blue-700 dark:text-blue-300',
        borderClass: 'border-blue-200 dark:border-blue-700',
        dotClass: 'bg-blue-500',
      },
      { 
        label: 'FAPSC', 
        abbrev: 'FAPSC',
        score: fapcScore, 
        remarks: fapcRemarks,
        color: 'purple',
        bgClass: 'bg-purple-50 dark:bg-purple-900/30',
        textClass: 'text-purple-700 dark:text-purple-300',
        borderClass: 'border-purple-200 dark:border-purple-700',
        dotClass: 'bg-purple-500',
      },
      { 
        label: 'UAPC', 
        abbrev: 'UAPC',
        score: uapcScore, 
        remarks: uapcRemarks,
        color: 'emerald',
        bgClass: 'bg-emerald-50 dark:bg-emerald-900/30',
        textClass: 'text-emerald-700 dark:text-emerald-300',
        borderClass: 'border-emerald-200 dark:border-emerald-700',
        dotClass: 'bg-emerald-500',
      },
    ];

    if (compact) {
      // Compact inline display for accordion headers
      return (
        <div className="flex items-center gap-1">
          {scores.map((s, i) => (
            <TooltipProvider key={s.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={`
                      flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all
                      ${s.score !== null && s.score !== undefined 
                        ? `${s.bgClass} ${s.textClass} border ${s.borderClass}` 
                        : 'bg-muted/40 text-muted-foreground/50 border border-dashed border-muted-foreground/20'
                      }
                    `}
                  >
                    <span className="opacity-70">{s.abbrev}</span>
                    <span className="font-bold">{s.score ?? '—'}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-semibold">{s.label}</p>
                  {s.score !== null && s.score !== undefined ? (
                    <>
                      <p className="text-sm">Score: {s.score}</p>
                      {s.remarks && <p className="text-xs text-muted-foreground mt-1">{s.remarks}</p>}
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">Not yet assessed</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      );
    }

    // Full display with timeline for expanded content
    return (
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assessment Scores</p>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-slate-300 via-blue-300 via-purple-300 to-emerald-300 dark:from-slate-600 dark:via-blue-600 dark:via-purple-600 dark:to-emerald-600" />
          
          <div className="space-y-2">
            {scores.map((s, index) => {
              const hasScore = s.score !== null && s.score !== undefined;
              return (
                <div key={s.label} className="flex items-start gap-3 relative">
                  {/* Timeline dot */}
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2
                    ${hasScore 
                      ? `${s.bgClass} ${s.borderClass}` 
                      : 'bg-background border-dashed border-muted-foreground/30'
                    }
                  `}>
                    {hasScore ? (
                      <CheckCircle2 className={`h-3 w-3 ${s.textClass}`} />
                    ) : (
                      <MinusCircle className="h-3 w-3 text-muted-foreground/40" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className={`
                    flex-1 rounded-lg p-3 border transition-all
                    ${hasScore 
                      ? `${s.bgClass} ${s.borderClass}` 
                      : 'bg-muted/20 border-dashed border-muted-foreground/20'
                    }
                  `}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold uppercase tracking-wider ${hasScore ? s.textClass : 'text-muted-foreground/50'}`}>
                        {s.label}
                      </span>
                      <span className={`text-lg font-bold ${hasScore ? s.textClass : 'text-muted-foreground/40'}`}>
                        {hasScore ? s.score : '—'}
                      </span>
                    </div>
                    {s.remarks && hasScore && (
                      <p className={`text-xs mt-1.5 ${s.textClass} opacity-80`}>
                        {s.remarks}
                      </p>
                    )}
                    {!hasScore && (
                      <p className="text-xs text-muted-foreground/50 mt-0.5">
                        Awaiting assessment
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Helper to handle file preview
  const handlePreviewFile = (url: string, fileName?: string) => {
    const name = fileName || url.split("/").pop() || "file";
    setPreviewFile({ url, fileName: name });
  };

  // Render evidence list with preview/download buttons
  const renderEvidenceList = (evidenceUrls: string[]) => {
    if (!evidenceUrls || evidenceUrls.length === 0) {
      return <p className="text-sm text-muted-foreground">No evidence provided</p>;
    }

    return (
      <div className="space-y-2">
        {evidenceUrls.map((url, index) => {
          const fileName = url.split("/").pop() || `Evidence ${index + 1}`;
          return (
            <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm truncate flex-1">{fileName}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handlePreviewFile(url, fileName)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Preview</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      asChild
                    >
                      <a href={url} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        })}
      </div>
    );
  };

  // Render previous committee scores for cascading display
  const renderPreviousScores = (dapcScore?: number, dapcRemarks?: string, fapcScore?: number, fapcRemarks?: string) => {
    const showDapc = shouldShowDapcScores() && (dapcScore !== null && dapcScore !== undefined);
    const showFapc = shouldShowFapcScores() && (fapcScore !== null && fapcScore !== undefined);

    if (!showDapc && !showFapc) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {showDapc && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                  DAPC: {dapcScore}
                </Badge>
              </TooltipTrigger>
              {dapcRemarks && (
                <TooltipContent className="max-w-xs">
                  <div className="text-xs [&_p]:my-1 [&_strong]:font-bold [&_em]:italic [&_ul]:my-1 [&_li]:ml-3">
                    <HtmlContent html={dapcRemarks} />
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
        {showFapc && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                  FAPSC: {fapcScore}
                </Badge>
              </TooltipTrigger>
              {fapcRemarks && (
                <TooltipContent className="max-w-xs">
                  <div className="text-xs [&_p]:my-1 [&_strong]:font-bold [&_em]:italic [&_ul]:my-1 [&_li]:ml-3">
                    <HtmlContent html={fapcRemarks} />
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  const updateTeachingScore = (key: string, score: number, remarks?: string) => {
    setTeachingScores((prev) => ({
      ...prev,
      [key]: { score, remarks },
    }));
  };

  const updatePublicationScore = (recordId: string, score: number, remarks?: string) => {
    setPublicationScores((prev) => ({
      ...prev,
      [recordId]: { recordId, score, remarks },
    }));
  };

  const updateServiceScore = (recordId: string, score: number, remarks?: string) => {
    setServiceScores((prev) => ({
      ...prev,
      [recordId]: { recordId, score, remarks },
    }));
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="content-container space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="page-container">
        <div className="content-container">
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center gap-4 py-6">
              <span className="text-destructive">Failed to load application. Please try again.</span>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="content-container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Application Review</h1>
                <p className="text-sm text-muted-foreground">
                  {application.applicantName} - {application.applyingForPosition}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{application.reviewStatus}</Badge>
              {effectiveCommittee?.isChairperson && <Badge variant="secondary">Chairperson</Badge>}
            </div>
          </div>
        </div>
      </header>

      <main className="content-container py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Applicant Info */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Applicant Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{application.applicantName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p>{application.applicantEmail}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Current Position</Label>
                  <p>{application.currentPosition}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Applying For</Label>
                  <p className="font-medium text-primary">{application.applyingForPosition}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Department</Label>
                  <p>{application.departmentName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Faculty</Label>
                  <p>{application.facultyName}</p>
                </div>
              </CardContent>
            </Card>

            {/* Assessment Tabs */}
            <Tabs defaultValue="teaching" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="teaching" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Teaching
                </TabsTrigger>
                <TabsTrigger value="publications" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Publications
                </TabsTrigger>
                <TabsTrigger value="services" className="gap-2">
                  <Briefcase className="h-4 w-4" />
                  Services
                </TabsTrigger>
              </TabsList>

              {/* Teaching Tab */}
              <TabsContent value="teaching">
                <Card className="card-elevated">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Teaching Assessment</CardTitle>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm text-muted-foreground">Performance:</span>
                        {getPerformanceBadge(application.teaching.applicantPerformance)}
                        {shouldShowDapcScores() && application.teaching.dapcPerformance && (
                          <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                            DAPC: {application.teaching.dapcPerformance}
                          </Badge>
                        )}
                        {shouldShowFapcScores() && application.teaching.fapcPerformance && (
                          <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                            FAPSC: {application.teaching.fapcPerformance}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="multiple" className="w-full">
                      {application.teaching.categories.map((category) => (
                        <AccordionItem key={category.categoryKey} value={category.categoryKey}>
                          <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center justify-between w-full pr-4 gap-4">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-medium break-words">{category.categoryName}</span>
                                {category.supportingEvidence.length > 0 && (
                                  <Badge variant="secondary" className="text-xs shrink-0">
                                    {category.supportingEvidence.length} files
                                  </Badge>
                                )}
                              </div>
                              <ScoreBreakdown
                                applicantScore={category.applicantScore}
                                dapcScore={category.dapcScore}
                                dapcRemarks={category.dapcRemarks}
                                fapcScore={category.fapcScore}
                                fapcRemarks={category.fapcRemarks}
                                uapcScore={category.uapcScore}
                                uapcRemarks={category.uapcRemarks}
                                compact
                              />
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-6 pt-4">
                            {/* Score Timeline - Full View */}
                            <ScoreBreakdown
                              applicantScore={category.applicantScore}
                              dapcScore={category.dapcScore}
                              dapcRemarks={category.dapcRemarks}
                              fapcScore={category.fapcScore}
                              fapcRemarks={category.fapcRemarks}
                              uapcScore={category.uapcScore}
                              uapcRemarks={category.uapcRemarks}
                            />

                            <Separator />

                            <div className="grid sm:grid-cols-2 gap-6">
                              <div>
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Applicant Remarks</Label>
                                <p className="text-sm mt-2 p-3 bg-muted/30 rounded-lg">
                                  {category.applicantRemarks || "No remarks provided"}
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Supporting Evidence</Label>
                                <div className="mt-2">
                                  {renderEvidenceList(category.supportingEvidence)}
                                </div>
                              </div>
                            </div>
                            {canSubmitScores && (
                              <ScoreInputPanel
                                currentScore={teachingScores[category.categoryKey]?.score}
                                maxScore={10}
                                onScoreChange={(score) =>
                                  updateTeachingScore(
                                    category.categoryKey,
                                    score,
                                    teachingScores[category.categoryKey]?.remarks
                                  )
                                }
                                remarks={teachingScores[category.categoryKey]?.remarks}
                                onRemarksChange={(remarks) =>
                                  updateTeachingScore(
                                    category.categoryKey,
                                    teachingScores[category.categoryKey]?.score || 0,
                                    remarks
                                  )
                                }
                                committeeType={getCurrentCommitteeType()}
                              />
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Publications Tab */}
              <TabsContent value="publications">
                <Card className="card-elevated">
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle>Publications ({application.publications.totalPublications})</CardTitle>
                      <div className="flex flex-wrap gap-2 items-center">
                        {getPerformanceBadge(application.publications.applicantPerformance)}
                        {shouldShowDapcScores() && application.publications.dapcPerformance && (
                          <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                            DAPC: {application.publications.dapcPerformance}
                          </Badge>
                        )}
                        {shouldShowFapcScores() && application.publications.fapcPerformance && (
                          <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                            FAPSC: {application.publications.fapcPerformance}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="multiple" className="w-full">
                      {application.publications.records.map((pub) => (
                        <AccordionItem key={pub.id} value={pub.id}>
                          <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-start justify-between w-full pr-4 gap-4">
                              <div className="flex-1 min-w-0 text-left">
                                <p className="font-medium break-words">{pub.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">{pub.publicationType || "N/A"}</Badge>
                                  <span className="text-xs text-muted-foreground">{pub.year}</span>
                                  {pub.isPresented && (
                                    <Badge className="text-xs bg-emerald-100 text-emerald-800 border-emerald-200">
                                      Presented{pub.presentationEvidence && pub.presentationEvidence.length > 0 ? ` · ${pub.presentationEvidence.length} file(s)` : ""}
                                    </Badge>
                                  )}
                                  {pub.supportingEvidence.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      {pub.supportingEvidence.length} files
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <ScoreBreakdown
                                applicantScore={pub.applicantScore}
                                systemScore={getEffectivePublicationScore(pub.systemGeneratedScore, pub.isPresented)}
                                dapcScore={pub.dapcScore}
                                dapcRemarks={pub.dapcRemarks}
                                fapcScore={pub.fapcScore}
                                fapcRemarks={pub.fapcRemarks}
                                uapcScore={pub.uapcScore}
                                uapcRemarks={pub.uapcRemarks}
                                compact
                              />
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-6 pt-4">
                            {/* Score Timeline - Full View */}
                            <ScoreBreakdown
                              applicantScore={pub.applicantScore}
                              systemScore={getEffectivePublicationScore(pub.systemGeneratedScore, pub.isPresented)}
                              dapcScore={pub.dapcScore}
                              dapcRemarks={pub.dapcRemarks}
                              fapcScore={pub.fapcScore}
                              fapcRemarks={pub.fapcRemarks}
                              uapcScore={pub.uapcScore}
                              uapcRemarks={pub.uapcRemarks}
                            />

                            <Separator />

                            <div className="grid sm:grid-cols-2 gap-6">
                              <div>
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Applicant Remarks</Label>
                                <p className="text-sm mt-2 p-3 bg-muted/30 rounded-lg">
                                  {pub.applicantRemarks || "No remarks provided"}
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Supporting Evidence</Label>
                                <div className="mt-2">
                                  {renderEvidenceList(pub.supportingEvidence)}
                                </div>
                              </div>
                            </div>
                            {pub.isPresented && (
                              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-3">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Presented at Conference / Forum</p>
                                  <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-md">
                                    <span className="text-[10px] text-emerald-700 font-semibold">Base: {pub.systemGeneratedScore}</span>
                                    <span className="text-emerald-300">+</span>
                                    <span className="text-[10px] text-emerald-700 font-bold">2 Bonus</span>
                                    <span className="text-emerald-300">=</span>
                                    <span className="text-sm font-bold text-emerald-800">{getEffectivePublicationScore(pub.systemGeneratedScore, true)}</span>
                                  </div>
                                </div>
                                {pub.presentationEvidence && pub.presentationEvidence.length > 0 ? (
                                  <div className="mt-2 space-y-1">
                                    {pub.presentationEvidence.map((url, i) => (
                                      <a
                                        key={i}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-900 underline underline-offset-2 transition-colors"
                                      >
                                        <span>Presentation evidence {pub.presentationEvidence!.length > 1 ? i + 1 : ""}</span>
                                      </a>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-emerald-700 italic">No evidence uploaded.</p>
                                )}
                              </div>
                            )}
                            {canSubmitScores && (
                              <ScoreInputPanel
                                currentScore={publicationScores[pub.id]?.score}
                                onScoreChange={(score) => updatePublicationScore(pub.id, score)}
                                remarks={publicationScores[pub.id]?.remarks}
                                onRemarksChange={(remarks) =>
                                  updatePublicationScore(
                                    pub.id,
                                    publicationScores[pub.id]?.score || 0,
                                    remarks
                                  )
                                }
                                committeeType={getCurrentCommitteeType()}
                              />
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services">
                <Card className="card-elevated">
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle>Service Records ({application.services.totalServiceRecords})</CardTitle>
                      <div className="flex flex-wrap gap-2 items-center">
                        {getPerformanceBadge(application.services.applicantPerformance)}
                        {shouldShowDapcScores() && application.services.dapcPerformance && (
                          <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                            DAPC: {application.services.dapcPerformance}
                          </Badge>
                        )}
                        {shouldShowFapcScores() && application.services.fapcPerformance && (
                          <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                            FAPSC: {application.services.fapcPerformance}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {application.services.universityService.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">University Service</h4>
                        <Accordion type="multiple" className="w-full">
                          {application.services.universityService.map((svc) => (
                            <AccordionItem key={svc.id} value={svc.id}>
                              <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex items-start justify-between w-full pr-4 gap-4">
                                  <div className="flex-1 min-w-0 text-left">
                                    <p className="font-medium break-words">{svc.serviceTitle || "N/A"}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-muted-foreground">{svc.role || "N/A"}</span>
                                      <span className="text-xs text-muted-foreground">• {svc.duration || "N/A"}</span>
                                      {svc.isActing && (
                                        <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-200">Acting</Badge>
                                      )}
                                      {svc.supportingEvidence.length > 0 && (
                                        <Badge variant="secondary" className="text-xs">
                                          {svc.supportingEvidence.length} files
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <ScoreBreakdown
                                    applicantScore={svc.applicantScore}
                                    systemScore={svc.systemGeneratedScore}
                                    dapcScore={svc.dapcScore}
                                    dapcRemarks={svc.dapcRemarks}
                                    fapcScore={svc.fapcScore}
                                    fapcRemarks={svc.fapcRemarks}
                                    uapcScore={svc.uapcScore}
                                    uapcRemarks={svc.uapcRemarks}
                                    compact
                                  />
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="space-y-6 pt-4">
                                {/* Score Timeline - Full View */}
                                <ScoreBreakdown
                                  applicantScore={svc.applicantScore}
                                  systemScore={svc.systemGeneratedScore}
                                  dapcScore={svc.dapcScore}
                                  dapcRemarks={svc.dapcRemarks}
                                  fapcScore={svc.fapcScore}
                                  fapcRemarks={svc.fapcRemarks}
                                  uapcScore={svc.uapcScore}
                                  uapcRemarks={svc.uapcRemarks}
                                />

                                <Separator />

                                <div className="grid sm:grid-cols-2 gap-6">
                                  <div>
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Applicant Remarks</Label>
                                    <p className="text-sm mt-2 p-3 bg-muted/30 rounded-lg">
                                      {svc.applicantRemarks || "No remarks provided"}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Supporting Evidence</Label>
                                    <div className="mt-2">
                                      {renderEvidenceList(svc.supportingEvidence)}
                                    </div>
                                  </div>
                                </div>
                                {svc.isActing && (
                                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">Acting / Temporary Position</p>
                                    <p className="text-[10px] text-amber-700">Score was halved (50%) as this is an acting position. The effective score shown has already been adjusted.</p>
                                  </div>
                                )}
                                {canSubmitScores && (
                                  <ScoreInputPanel
                                    currentScore={serviceScores[svc.id]?.score}
                                    onScoreChange={(score) => updateServiceScore(svc.id, score)}
                                    remarks={serviceScores[svc.id]?.remarks}
                                    onRemarksChange={(remarks) =>
                                      updateServiceScore(
                                        svc.id,
                                        serviceScores[svc.id]?.score || 0,
                                        remarks
                                      )
                                    }
                                    committeeType={getCurrentCommitteeType()}
                                  />
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    )}
                    {application.services.nationalInternationalService.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">National/International Service</h4>
                        <Accordion type="multiple" className="w-full">
                          {application.services.nationalInternationalService.map((svc) => (
                            <AccordionItem key={svc.id} value={svc.id}>
                              <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex items-start justify-between w-full pr-4 gap-4">
                                  <div className="flex-1 min-w-0 text-left">
                                    <p className="font-medium break-words">{svc.serviceTitle || "N/A"}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-muted-foreground">{svc.role || "N/A"}</span>
                                      <span className="text-xs text-muted-foreground">• {svc.duration || "N/A"}</span>
                                      {svc.isActing && (
                                        <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-200">Acting</Badge>
                                      )}
                                      {svc.supportingEvidence.length > 0 && (
                                        <Badge variant="secondary" className="text-xs">
                                          {svc.supportingEvidence.length} files
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <ScoreBreakdown
                                    applicantScore={svc.applicantScore}
                                    systemScore={svc.systemGeneratedScore}
                                    dapcScore={svc.dapcScore}
                                    dapcRemarks={svc.dapcRemarks}
                                    fapcScore={svc.fapcScore}
                                    fapcRemarks={svc.fapcRemarks}
                                    uapcScore={svc.uapcScore}
                                    uapcRemarks={svc.uapcRemarks}
                                    compact
                                  />
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="space-y-6 pt-4">
                                {/* Score Timeline - Full View */}
                                <ScoreBreakdown
                                  applicantScore={svc.applicantScore}
                                  systemScore={svc.systemGeneratedScore}
                                  dapcScore={svc.dapcScore}
                                  dapcRemarks={svc.dapcRemarks}
                                  fapcScore={svc.fapcScore}
                                  fapcRemarks={svc.fapcRemarks}
                                  uapcScore={svc.uapcScore}
                                  uapcRemarks={svc.uapcRemarks}
                                />

                                <Separator />

                                <div className="grid sm:grid-cols-2 gap-6">
                                  <div>
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Applicant Remarks</Label>
                                    <p className="text-sm mt-2 p-3 bg-muted/30 rounded-lg">
                                      {svc.applicantRemarks || "No remarks provided"}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Supporting Evidence</Label>
                                    <div className="mt-2">
                                      {renderEvidenceList(svc.supportingEvidence)}
                                    </div>
                                  </div>
                                </div>
                                {svc.isActing && (
                                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">Acting / Temporary Position</p>
                                    <p className="text-[10px] text-amber-700">Score was halved (50%) as this is an acting position. The effective score shown has already been adjusted.</p>
                                  </div>
                                )}
                                {canSubmitScores && (
                                  <ScoreInputPanel
                                    currentScore={serviceScores[svc.id]?.score}
                                    onScoreChange={(score) => updateServiceScore(svc.id, score)}
                                    remarks={serviceScores[svc.id]?.remarks}
                                    onRemarksChange={(remarks) =>
                                      updateServiceScore(
                                        svc.id,
                                        serviceScores[svc.id]?.score || 0,
                                        remarks
                                      )
                                    }
                                    committeeType={getCurrentCommitteeType()}
                                  />
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Overall Remarks & Actions */}
            {canSubmitScores && (
              <Card className="card-elevated border-2 border-primary/20">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Assessment Summary
                  </CardTitle>
                  <CardDescription>
                    Your overall assessment will be recorded and visible to subsequent committees
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div>
                    <Label className="text-sm font-semibold">Overall Remarks</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Summarize your assessment findings, key observations, and any concerns
                    </p>
                    <Textarea
                      placeholder="E.g., 'Teaching assessment shows strong performance across all categories. Publications are well-documented with adequate evidence. Service records require additional verification...'"
                      value={overallRemarks}
                      onChange={(e) => setOverallRemarks(e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => submitScoresMutation.mutate()}
                      disabled={submitScoresMutation.isPending}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save Assessment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Committee Notice — shown when user has a role but can't act right now */}
            {effectiveCommittee && !canSubmitScores && (
              <Card className="card-elevated border-2 border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20">
                <CardContent className="flex items-start gap-3 pt-6">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Assessment Not Available</p>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      {!isPending
                        ? <>This application is not pending. Only submitted (pending) applications can be assessed.</>                        : <>This application is currently at <span className="font-semibold">{application?.reviewStatus}</span> stage and is not assigned to your committee.</>}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Summary - Shows all committee level performances */}
            <Card className="card-elevated overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Performance Overview
                </CardTitle>
                <CardDescription className="text-xs">
                  Assessment progression by committee
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Performance Matrix */}
                <div className="divide-y divide-border/50">
                  {/* Teaching Performance Row */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded">
                        <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-semibold text-sm">Teaching</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      <PerformanceCell 
                        label="Self" 
                        value={application.teaching.applicantPerformance} 
                        score={calculateTeachingTotals().self}
                        color="slate"
                      />
                      <PerformanceCell 
                        label="DAPC" 
                        value={application.teaching.dapcPerformance} 
                        score={calculateTeachingTotals().dapc}
                        color="blue"
                      />
                      <PerformanceCell 
                        label="FAPSC" 
                        value={application.teaching.fapcPerformance} 
                        score={calculateTeachingTotals().fapsc}
                        color="purple"
                      />
                      <PerformanceCell 
                        label="UAPC" 
                        value={application.teaching.uapcPerformance} 
                        score={calculateTeachingTotals().uapc}
                        color="emerald"
                        isFinal
                      />
                    </div>
                  </div>

                  {/* Publications Performance Row */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded">
                        <FileText className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="font-semibold text-sm">Publications</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      <PerformanceCell 
                        label="Self" 
                        value={application.publications.applicantPerformance} 
                        score={calculatePublicationTotals().self}
                        color="slate"
                      />
                      <PerformanceCell 
                        label="DAPC" 
                        value={application.publications.dapcPerformance} 
                        score={calculatePublicationTotals().dapc}
                        color="blue"
                      />
                      <PerformanceCell 
                        label="FAPSC" 
                        value={application.publications.fapcPerformance}
                        score={calculatePublicationTotals().fapsc}
                        color="purple"
                      />
                      <PerformanceCell 
                        label="UAPC" 
                        value={application.publications.uapcPerformance}
                        score={calculatePublicationTotals().uapc}
                        color="emerald"
                        isFinal
                      />
                    </div>
                  </div>

                  {/* Services Performance Row */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-rose-100 dark:bg-rose-900/30 rounded">
                        <Briefcase className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                      </div>
                      <span className="font-semibold text-sm">Services</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      <PerformanceCell 
                        label="Self" 
                        value={application.services.applicantPerformance}
                        score={calculateServiceTotals().self}
                        color="slate"
                      />
                      <PerformanceCell 
                        label="DAPC" 
                        value={application.services.dapcPerformance}
                        score={calculateServiceTotals().dapc}
                        color="blue"
                      />
                      <PerformanceCell 
                        label="FAPSC" 
                        value={application.services.fapcPerformance}
                        score={calculateServiceTotals().fapsc}
                        color="purple"
                      />
                      <PerformanceCell 
                        label="UAPC" 
                        value={application.services.uapcPerformance}
                        score={calculateServiceTotals().uapc}
                        color="emerald"
                        isFinal
                      />
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="px-4 py-3 bg-muted/30 border-t">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Performance Levels</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-muted-foreground">High</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px]">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="text-muted-foreground">Good</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px]">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span className="text-muted-foreground">Adequate</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px]">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span className="text-muted-foreground">Inadequate</span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {canAdvanceOrReturn && (
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {isUAPC ? (
                      <>
                        <Award className="h-4 w-4 text-emerald-600" />
                        <span>Final Decision</span>
                      </>
                    ) : (
                      "Committee Actions"
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isUAPC 
                      ? "As UAPC Chairperson, you will make the final promotion decision"
                      : "Actions available to the chairperson"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!canAct ? (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Actions Not Available</p>
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          {!isPending
                            ? <>Application is not pending. Only submitted (pending) applications can be acted upon.</>                            : <>Application is at <span className="font-semibold">{application?.reviewStatus}</span> stage and is not assigned to your committee.</>}
                        </p>
                      </div>
                    </div>
                  ) : isUAPC ? (
                    <>
                      {/* UAPC: Approve Promotion */}
                      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700" variant="default">
                            <CheckCircle2 className="h-4 w-4" />
                            Review & Approve Promotion
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden gap-0 flex flex-col max-h-[90vh]">
                          <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 px-8 pt-8 pb-10 text-white overflow-hidden">
                            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
                            <div className="absolute -bottom-10 -left-8 w-28 h-28 rounded-full bg-white/10" />
                            <div className="relative space-y-4">
                              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                <Award className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">Promotion Validation</p>
                                <DialogTitle className="text-2xl font-bold text-white leading-tight">Review & Approve Promotion</DialogTitle>
                                <p className="mt-2 max-w-2xl text-sm text-white/80">
                                  Check the final validation analysis and confirm the UAPC recommendation with confidence.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="px-8 -mt-4 relative z-10">
                            <div className="flex flex-wrap gap-2">
                              {[
                                { icon: CheckCircle2, label: "Approve" },
                                { icon: AlertCircle, label: "Validate" },
                                { icon: User, label: "UAPC" },
                              ].map(({ icon: Icon, label }) => (
                                <span key={label} className="inline-flex items-center gap-1.5 bg-white/95 text-emerald-800 border border-emerald-200 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm">
                                  <Icon className="w-3.5 h-3.5 text-emerald-600" />
                                  {label}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex-1 min-h-0 overflow-y-auto px-8 py-4">
                            <DialogDescription className="sr-only">Confirm final promotion approval and validation.</DialogDescription>
                            <div className="space-y-4">
                              {/* Loading State */}
                              {isValidating && (
                                <div className="flex items-center justify-center py-8">
                                  <div className="flex flex-col items-center gap-3">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
                                    <p className="text-sm text-muted-foreground">Validating application...</p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Error State */}
                              {validationError && !isValidating && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                  <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
                                    <AlertCircle className="h-5 w-5" />
                                    <p className="font-medium">Validation Error</p>
                                  </div>
                                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">{validationError}</p>
                                </div>
                              )}
                              
                              {/* Validation Results */}
                              {validationData && !isValidating && (
                                <>
                                  {/* Recommendation Banner */}
                                  <div className={`p-4 rounded-lg border ${
                                    validationData.recommendation === "Approve"
                                      ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                                      : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                                  }`}>
                                    <div className="flex items-center gap-3">
                                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                                        validationData.recommendation === "Approve"
                                          ? "bg-emerald-100 dark:bg-emerald-800"
                                          : "bg-amber-100 dark:bg-amber-800"
                                      }`}>
                                        {validationData.recommendation === "Approve" ? (
                                          <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                        ) : (
                                          <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <p className={`font-semibold ${
                                          validationData.recommendation === "Approve"
                                            ? "text-emerald-900 dark:text-emerald-100"
                                            : "text-amber-900 dark:text-amber-100"
                                        }`}>
                                          System Recommendation: {validationData.recommendation === "Approve" ? "Approve" : "Return for Update"}
                                        </p>
                                        <p className={`text-sm ${
                                          validationData.recommendation === "Approve"
                                            ? "text-emerald-700 dark:text-emerald-300"
                                            : "text-amber-700 dark:text-amber-300"
                                        }`}>
                                          {validationData.summary}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Applicant Info */}
                                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                        <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                      </div>
                                      <div>
                                        <p className="font-semibold">{validationData.applicantName}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {validationData.currentPosition} → <strong>{validationData.applyingForPosition}</strong>
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Requirements vs Performance */}
                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-sm">Requirements Analysis</h4>
                                    <div className="space-y-2">
                                      {validationData.validationItems.map((item, idx) => (
                                        <div 
                                          key={idx}
                                          className={`p-3 rounded-lg border ${
                                            item.isMet
                                              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                              : item.severity === "Critical"
                                                ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                                : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                                          }`}
                                        >
                                          <div className="flex items-start gap-3">
                                            {item.isMet ? (
                                              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                            ) : item.severity === "Critical" ? (
                                              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                            ) : (
                                              <MinusCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium text-sm">{item.category}</span>
                                                <Badge variant={item.isMet ? "default" : "destructive"} className="text-xs">
                                                  {item.isMet ? "Met" : "Not Met"}
                                                </Badge>
                                              </div>
                                              <p className="text-xs text-muted-foreground mt-0.5">
                                                Required: {item.requirement}
                                              </p>
                                              <p className="text-sm mt-1">
                                                <span className="font-medium">Actual:</span> {item.actualValue}
                                              </p>
                                              {item.notes && (
                                                <p className={`text-xs mt-1 ${
                                                  item.isMet 
                                                    ? "text-green-700 dark:text-green-400"
                                                    : "text-red-700 dark:text-red-400"
                                                }`}>
                                                  {item.notes}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Strengths */}
                                  {validationData.strengths.length > 0 && (
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                      <p className="font-semibold text-sm text-green-800 dark:text-green-200 mb-2">
                                        Strengths
                                      </p>
                                      <ul className="space-y-1">
                                        {validationData.strengths.map((strength, idx) => (
                                          <li key={idx} className="text-sm text-green-700 dark:text-green-300 flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            {strength}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Areas for Improvement */}
                                  {validationData.areasForImprovement.length > 0 && (
                                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                      <p className="font-semibold text-sm text-amber-800 dark:text-amber-200 mb-2">
                                        Areas for Improvement
                                      </p>
                                      <ul className="space-y-1">
                                        {validationData.areasForImprovement.map((area, idx) => (
                                          <li key={idx} className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            {area}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Performance Summary */}
                                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
                                    <p className="font-semibold text-sm mb-2">Performance Summary</p>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                      <div className="text-center p-2 bg-white dark:bg-slate-700 rounded">
                                        <p className="text-xs text-muted-foreground">Teaching</p>
                                        <p className="font-medium">{validationData.performance.teachingPerformance}</p>
                                        <p className="text-xs text-muted-foreground">{validationData.performance.teachingScore.toFixed(1)} pts</p>
                                      </div>
                                      <div className="text-center p-2 bg-white dark:bg-slate-700 rounded">
                                        <p className="text-xs text-muted-foreground">Publications</p>
                                        <p className="font-medium">{validationData.performance.publicationPerformance}</p>
                                        <p className="text-xs text-muted-foreground">{validationData.performance.publicationScore.toFixed(1)} pts</p>
                                      </div>
                                      <div className="text-center p-2 bg-white dark:bg-slate-700 rounded">
                                        <p className="text-xs text-muted-foreground">Service</p>
                                        <p className="font-medium">{validationData.performance.servicePerformance}</p>
                                        <p className="text-xs text-muted-foreground">{validationData.performance.serviceScore.toFixed(1)} pts</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Override Warning for non-recommended approvals */}
                                  {validationData.recommendation === "ReturnForUpdate" && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                      <p className="text-sm text-red-800 dark:text-red-300">
                                        <strong>Warning:</strong> Approving this application will override the system recommendation. Ensure you have valid reasons for this decision.
                                      </p>
                                    </div>
                                  )}

                                  <div>
                                    <Label className="text-sm font-semibold">
                                      Final Remarks (Optional)
                                    </Label>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      Add any final comments or commendations for the record
                                    </p>
                                    <Textarea
                                      placeholder="E.g., 'Exceptional performance in research and teaching. Well-deserving of this promotion...'"
                                      value={approvalRemarks}
                                      onChange={(e) => setApprovalRemarks(e.target.value)}
                                      rows={3}
                                      className="resize-none"
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="px-8 pb-7 border-t pt-4 flex flex-col-reverse sm:flex-row justify-end gap-2">
                            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                              Cancel
                            </Button>
                            {validationData && (
                              <Button
                                onClick={() => approveMutation.mutate()}
                                disabled={approveMutation.isPending || isValidating}
                                className={`gap-2 ${
                                  validationData.recommendation === "Approve"
                                    ? "bg-emerald-600 hover:bg-emerald-700"
                                    : "bg-amber-600 hover:bg-amber-700"
                                }`}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                {approveMutation.isPending 
                                  ? "Approving..." 
                                  : validationData.recommendation === "Approve"
                                    ? "Confirm Approval"
                                    : "Override & Approve"
                                }
                              </Button>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* UAPC: Return for Update */}
                      <Dialog open={uapcReturnDialogOpen} onOpenChange={setUapcReturnDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full gap-2" variant="outline">
                            <RotateCcw className="h-4 w-4" />
                            Return for Update
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0 flex flex-col max-h-[80vh]">
                          <div className="relative bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 px-8 pt-8 pb-10 text-white overflow-hidden">
                            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
                            <div className="absolute -bottom-10 -left-8 w-28 h-28 rounded-full bg-white/10" />
                            <div className="relative space-y-4">
                              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                <RotateCcw className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">Return for Update</p>
                                <DialogTitle className="text-2xl font-bold text-white leading-tight">Send Feedback to the Applicant</DialogTitle>
                                <p className="mt-2 max-w-xl text-sm text-white/80">
                                  Provide clear, actionable guidance so the applicant can improve and resubmit with confidence.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="px-8 -mt-4 relative z-10">
                            <div className="flex flex-wrap gap-2">
                              {[
                                { icon: RotateCcw, label: "Return" },
                                { icon: FileText, label: "Feedback" },
                                { icon: User, label: "Applicant" },
                              ].map(({ icon: Icon, label }) => (
                                <span key={label} className="inline-flex items-center gap-1.5 bg-white/95 text-amber-800 border border-amber-200 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm">
                                  <Icon className="w-3.5 h-3.5 text-amber-600" />
                                  {label}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex-1 min-h-0 overflow-y-auto space-y-4 py-4 px-8">
                            <DialogDescription className="sr-only">Send clear feedback to the applicant for revisions before resubmitting.</DialogDescription>
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
                              <p className="text-sm text-amber-800 dark:text-amber-300">
                                <strong>Important:</strong> Provide clear feedback so the applicant knows exactly what needs to be addressed before resubmission.
                              </p>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-semibold">
                                Detailed Feedback *
                              </Label>
                              <p className="text-xs text-muted-foreground mb-2">
                                Explain what needs to be improved or updated.
                              </p>
                              <RichTextEditor
                                content={uapcReturnRemarks}
                                onChange={(html) => setUapcReturnRemarks(html)}
                                placeholder="E.g., 'Additional evidence required for publication claims. Please provide DOI links or acceptance letters for items 3, 5, and 7...'"
                              />
                            </div>
                          </div>

                          <div className="px-8 pb-7 flex flex-col-reverse sm:flex-row justify-end gap-2">
                            <Button variant="outline" onClick={() => setUapcReturnDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button
                              variant="default"
                              className="gap-2 bg-amber-600 hover:bg-amber-700"
                              onClick={() => uapcReturnMutation.mutate()}
                              disabled={uapcReturnMutation.isPending || !uapcReturnRemarks.trim() || uapcReturnRemarks === '<p></p>'}
                            >
                              <RotateCcw className="h-4 w-4" />
                              {uapcReturnMutation.isPending ? "Processing..." : "Return for Update"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  ) : (
                    <>
                      {/* DAPC/FAPSC: Advance to Next Stage */}
                      <Dialog open={advanceDialogOpen} onOpenChange={setAdvanceDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full gap-2" variant="default">
                            <ArrowRight className="h-4 w-4" />
                            Advance to Next Stage
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0 flex flex-col max-h-[80vh]">
                          <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-8 pt-8 pb-10 text-white overflow-hidden">
                            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
                            <div className="absolute -bottom-10 -left-8 w-28 h-28 rounded-full bg-white/10" />
                            <div className="relative space-y-4">
                              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                <ArrowRight className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">Advance Application</p>
                                <DialogTitle className="text-2xl font-bold text-white leading-tight">Send to the Next Committee</DialogTitle>
                                <p className="mt-2 max-w-xl text-sm text-white/80">
                                  Forward the application with your recommendation and help the next committee move faster.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="px-8 -mt-4 relative z-10">
                            <div className="flex flex-wrap gap-2">
                              {[
                                { icon: ArrowRight, label: "Advance" },
                                { icon: FileText, label: "Review" },
                                { icon: User, label: "Committee" },
                              ].map(({ icon: Icon, label }) => (
                                <span key={label} className="inline-flex items-center gap-1.5 bg-white/95 text-blue-800 border border-blue-200 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm">
                                  <Icon className="w-3.5 h-3.5 text-blue-600" />
                                  {label}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex-1 min-h-0 overflow-y-auto space-y-4 py-4 px-8">
                            <DialogDescription className="sr-only">Confirm forwarding to the next committee for review.</DialogDescription>
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                              <p className="text-sm text-blue-800 dark:text-blue-300">
                                <strong>Note:</strong> Your recommendation will be recorded and visible to the next committee.
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-semibold">
                                Recommendation / Remarks
                              </Label>
                              <p className="text-xs text-muted-foreground mb-2">
                                Provide your assessment summary or key observations for the next committee.
                              </p>
                              <Textarea
                                placeholder="E.g., 'Applicant meets all requirements for teaching and publications. Recommend approval pending service verification...'"
                                value={advanceRecommendation}
                                onChange={(e) => setAdvanceRecommendation(e.target.value)}
                                rows={4}
                                className="resize-none"
                              />
                            </div>
                          </div>
                          <div className="px-8 pb-7 flex flex-col-reverse sm:flex-row justify-end gap-2">
                            <Button variant="outline" onClick={() => setAdvanceDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button
                              onClick={() => advanceMutation.mutate()}
                              disabled={advanceMutation.isPending}
                              className="gap-2"
                            >
                              <ArrowRight className="h-4 w-4" />
                              Advance Application
                            </Button>
                          </div>
                        </DialogContent>
                  </Dialog>

                      {/* DAPC/FAPSC: Return to Applicant */}
                      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full gap-2" variant="outline">
                            <RotateCcw className="h-4 w-4" />
                            Return to Applicant
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0 flex flex-col max-h-[80vh]">
                          <div className="relative bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800 px-8 pt-8 pb-10 text-white overflow-hidden">
                            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
                            <div className="absolute -bottom-10 -left-8 w-28 h-28 rounded-full bg-white/10" />
                            <div className="relative space-y-4">
                              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                <RotateCcw className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">Return Application</p>
                                <DialogTitle className="text-2xl font-bold text-white leading-tight">Send It Back for Revision</DialogTitle>
                                <p className="mt-2 max-w-xl text-sm text-white/80">
                                  Share the reasons and expectations clearly so the applicant can improve the submission.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="px-8 -mt-4 relative z-10">
                            <div className="flex flex-wrap gap-2">
                              {[
                                { icon: RotateCcw, label: "Return" },
                                { icon: FileText, label: "Explain" },
                                { icon: User, label: "Revise" },
                              ].map(({ icon: Icon, label }) => (
                                <span key={label} className="inline-flex items-center gap-1.5 bg-white/95 text-rose-800 border border-rose-200 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm">
                                  <Icon className="w-3.5 h-3.5 text-rose-600" />
                                  {label}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex-1 min-h-0 overflow-y-auto space-y-4 py-4 px-8">
                            <DialogDescription className="sr-only">Return the application to the applicant for revision with clear instructions.</DialogDescription>
                            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-200 dark:border-rose-800">
                              <p className="text-sm text-rose-800 dark:text-rose-300">
                                <strong>Tip:</strong> A concise return reason helps the applicant resolve issues faster.
                              </p>
                            </div>
                            <div>
                              <Label>Reason for Return *</Label>
                              <Input
                                placeholder="Brief reason..."
                                value={returnReason}
                                onChange={(e) => setReturnReason(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Detailed Comments</Label>
                              <RichTextEditor
                                content={returnDetails}
                                onChange={(html) => setReturnDetails(html)}
                                placeholder="Provide detailed feedback..."
                              />
                            </div>
                          </div>
                          <div className="px-8 pb-7 flex flex-col-reverse sm:flex-row justify-end gap-2">
                            <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => returnMutation.mutate()}
                              disabled={returnMutation.isPending || !returnReason}
                            >
                              Return Application
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Previous Assessments */}
            {application.previousAssessments.length > 0 && (
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Committee Assessments
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Score submissions and remarks from each committee
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-72">
                    <div className="space-y-4">
                      {application.previousAssessments.map((assessment, index) => (
                        <div key={index} className="p-4 bg-muted/50 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <Badge 
                              variant="outline" 
                              className={
                                assessment.committeeLevel === "DAPC" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                assessment.committeeLevel === "FAPSC" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }
                            >
                              {assessment.committeeLevel}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(assessment.assessmentDate), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Assessed by: <span className="font-medium text-foreground">{assessment.assessedBy || "Unknown"}</span>
                          </p>
                          {assessment.overallRemarks && (
                            <div className="mt-3 p-3 bg-background rounded-md border">
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Overall Remarks</p>
                              <p className="text-sm italic text-foreground">"{assessment.overallRemarks}"</p>
                            </div>
                          )}
                          {assessment.recommendation && assessment.recommendation !== assessment.overallRemarks && (
                            <div className="mt-2 p-3 bg-background rounded-md border">
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Recommendation</p>
                              <p className="text-sm italic text-foreground">"{assessment.recommendation}"</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Activity History */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Activity Timeline
                </CardTitle>
                <CardDescription className="text-xs">
                  Complete history of all actions on this application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-72">
                  <div className="space-y-4">
                    {application.activityHistory.map((activity) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                          activity.activityType === "ScoreSubmitted" ? "bg-green-500" :
                          activity.activityType === "ApplicationAdvanced" ? "bg-blue-500" :
                          activity.activityType === "ApplicationReturned" ? "bg-amber-500" :
                          activity.activityType === "CommentAdded" ? "bg-purple-500" :
                          "bg-primary"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {activity.activityType.replace(/([A-Z])/g, ' $1').trim()}
                            </Badge>
                            {activity.committeeLevel && (
                              <Badge variant="secondary" className="text-xs">{activity.committeeLevel}</Badge>
                            )}
                            {activity.isChairperson && (
                              <Badge variant="outline" className="text-xs bg-amber-50 border-amber-200 text-amber-700">Chair</Badge>
                            )}
                          </div>
                          <p className="text-sm mt-1">{activity.description}</p>
                          {activity.additionalData?.remarks && (
                            <div className="mt-2 p-2 bg-muted/50 rounded border-l-2 border-primary">
                              <p className="text-xs font-semibold text-muted-foreground mb-0.5">Remarks:</p>
                              <p className="text-sm italic">"{activity.additionalData.remarks}"</p>
                            </div>
                          )}
                          {activity.additionalData?.returnReason && (
                            <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded border-l-2 border-amber-500">
                              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-0.5">Return Reason:</p>
                              <p className="text-sm text-amber-800 dark:text-amber-300">"{activity.additionalData.returnReason}"</p>
                            </div>
                          )}
                          {activity.previousStatus && activity.newStatus && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Status: {activity.previousStatus} → {activity.newStatus}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            By {activity.performedBy} • {formatDistanceToNow(new Date(activity.activityDate), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        fileUrl={previewFile?.url || ""}
        fileName={previewFile?.fileName || ""}
      />
    </div>
  );
}
