import { getEvidenceFileName } from "@/lib/files";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import assessmentApi from "@/services/assessmentApi";
import { Badge } from "@/components/ui/badge";
import { HtmlContent } from "@/components/common/HtmlContent";
import { Dialog } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect, useId } from "react";
import { toast } from "sonner";
import { CategoryScore, RecordScore, PromotionValidationResponse } from "@/types/assessment";
import { EvidenceList } from "@/components/review/EvidenceList";

export function useApplicationReview() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // State for scores
  const [performanceAtWorkScores, setPerformanceAtWorkScores] = useState<Record<string, CategoryScore>>({});
  const [knowledgeProfessionScores, setKnowledgeProfessionScores] = useState<Record<string, RecordScore>>({});
  const [serviceScores, setServiceScores] = useState<Record<string, RecordScore>>({});
  const [overallRemarks, setOverallRemarks] = useState("");

  // Comment state
  const [commentText, setCommentText] = useState("");
  const [commentCategory, setCommentCategory] = useState("Overall");
  const commentTextId = useId();

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
      HOU: "HOU Review",
      AAPSC: "AAPSC Review",
      UAPC: "UAPC Decision",
    };
    return reviewStatusMap[c.committeeType] === application?.reviewStatus;
  });

  // If no match by review status, check if user is chairperson in any relevant committee
  // This handles cases where application status is loading or in transition
  const chairpersonFallback = !currentCommittee && user?.committees.find((c) => 
    c.isChairperson && (c.committeeType === "HOU" || c.committeeType === "AAPSC" || c.committeeType === "UAPC")
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
        performanceAtWorkScores: Object.keys(performanceAtWorkScores).length > 0 ? {
          accuracyOnSchedule: performanceAtWorkScores["AccuracyOnSchedule"],
          qualityOfWork: performanceAtWorkScores["QualityOfWork"],
          punctualityAndRegularity: performanceAtWorkScores["PunctualityAndRegularity"],
          knowledgeOfProcedures: performanceAtWorkScores["KnowledgeOfProcedures"],
          abilityToWorkOnOwn: performanceAtWorkScores["AbilityToWorkOnOwn"],
          abilityToWorkUnderPressure: performanceAtWorkScores["AbilityToWorkUnderPressure"],
          additionalResponsibility: performanceAtWorkScores["AdditionalResponsibility"],
          humanRelations: performanceAtWorkScores["HumanRelations"],
          initiativeAndForesight: performanceAtWorkScores["InitiativeAndForesight"],
          abilityToInspireAndMotivate: performanceAtWorkScores["AbilityToInspireAndMotivate"],
        } : undefined,
        knowledgeProfessionScores: Object.values(knowledgeProfessionScores),
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

  const addCommentMutation = useMutation({
    mutationFn: async () => {
      if (!commentText.trim()) {
        throw new Error("Comment cannot be empty");
      }
      const response = await assessmentApi.addComment({
        applicationId: applicationId!,
        category: commentCategory,
        comment: commentText.trim(),
      });
      if (response.code < 200 || response.code >= 300) {
        throw new Error(response.message || "Failed to add comment");
      }
      return response;
    },
    onSuccess: () => {
      toast.success("Comment added");
      setCommentText("");
      setCommentCategory("Overall");
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
        throw new Error("Application is not pending and cannot be returned");
      }
      const response = await assessmentApi.returnApplicationForUpdate(applicationId!, uapcReturnRemarks);
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
  const calculatePerformanceAtWorkTotals = () => {
    const categories = application?.performanceAtWork?.categories || [];
    return {
      self: categories.reduce((sum, c) => sum + (c.applicantScore || 0), 0),
      dapc: categories.reduce((sum, c) => sum + (c.houScore || 0), 0),
      fapsc: categories.reduce((sum, c) => sum + (c.aapscScore || 0), 0),
      uapc: categories.reduce((sum, c) => sum + (c.uapcScore || 0), 0),
    };
  };

  const calculateKnowledgeProfessionTotals = () => {
    const records = application?.knowledgeProfession?.materials || [];
    return {
      self: records.reduce((sum, r) => {
        // Use applicant score if provided, otherwise use the system score
        // (already includes the presentation bonus when applicable)
        const score = r.applicantScore ?? r.systemGeneratedScore;
        return sum + (score || 0);
      }, 0),
      dapc: records.reduce((sum, r) => sum + (r.houScore || 0), 0),
      fapsc: records.reduce((sum, r) => sum + (r.aapscScore || 0), 0),
      uapc: records.reduce((sum, r) => sum + (r.uapcScore || 0), 0),
    };
  };

  const calculateServiceTotals = () => {
    const university = application?.services?.universityServices || [];
    const national = application?.services?.nationalInternationalServices || [];
    const all = [...university, ...national];
    return {
      self: all.reduce((sum, r) => sum + (r.applicantScore || r.systemGeneratedScore || 0), 0),
      dapc: all.reduce((sum, r) => sum + (r.houScore || 0), 0),
      fapsc: all.reduce((sum, r) => sum + (r.aapscScore || 0), 0),
      uapc: all.reduce((sum, r) => sum + (r.uapcScore || 0), 0),
    };
  };

  // Helper to get current committee type
  const getCurrentCommitteeType = () => effectiveCommittee?.committeeType || "HOU";

  // Helper to determine which previous scores to show based on current committee
  const shouldShowHouScores = () => {
    const committee = getCurrentCommitteeType();
    return committee === "AAPSC" || committee === "UAPC";
  };

  const shouldShowAapscScores = () => {
    const committee = getCurrentCommitteeType();
    return committee === "UAPC";
  };

  // Helper to handle file preview
  const handlePreviewFile = (url: string, fileName?: string) => {
    const name = fileName || getEvidenceFileName(url) || "file";
    setPreviewFile({ url, fileName: name });
  };
  const renderEvidenceList = (evidenceUrls: string[]) => <EvidenceList evidenceUrls={evidenceUrls} onPreview={handlePreviewFile} />;


  // Render previous committee scores for cascading display
  const renderPreviousScores = (houScore?: number, houRemarks?: string, aapscScore?: number, aapscRemarks?: string) => {
    const showHou = shouldShowHouScores() && (houScore !== null && houScore !== undefined);
    const showAapsc = shouldShowAapscScores() && (aapscScore !== null && aapscScore !== undefined);

    if (!showHou && !showAapsc) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {showHou && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                  HOU: {houScore}
                </Badge>
              </TooltipTrigger>
              {houRemarks && (
                <TooltipContent className="max-w-xs">
                  <div className="text-xs [&_p]:my-1 [&_strong]:font-bold [&_em]:italic [&_ul]:my-1 [&_li]:ml-3">
                    <HtmlContent html={houRemarks} />
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
        {showAapsc && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                  AAPSC: {aapscScore}
                </Badge>
              </TooltipTrigger>
              {aapscRemarks && (
                <TooltipContent className="max-w-xs">
                  <div className="text-xs [&_p]:my-1 [&_strong]:font-bold [&_em]:italic [&_ul]:my-1 [&_li]:ml-3">
                    <HtmlContent html={aapscRemarks} />
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  const updatePerformanceAtWorkScore = (key: string, score: number, remarks?: string) => {
    setPerformanceAtWorkScores((prev) => ({
      ...prev,
      [key]: { score, remarks },
    }));
  };

  const updateKnowledgeProfessionScore = (recordId: string, score: number, remarks?: string) => {
    setKnowledgeProfessionScores((prev) => ({
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
  return {
    navigate,
    user,
    performanceAtWorkScores,
    knowledgeProfessionScores,
    serviceScores,
    overallRemarks,
    setOverallRemarks,
    commentText,
    setCommentText,
    commentCategory,
    setCommentCategory,
    commentTextId,
    returnDialogOpen,
    setReturnDialogOpen,
    advanceDialogOpen,
    setAdvanceDialogOpen,
    approveDialogOpen,
    setApproveDialogOpen,
    uapcReturnDialogOpen,
    setUapcReturnDialogOpen,
    returnReason,
    setReturnReason,
    returnDetails,
    setReturnDetails,
    advanceRecommendation,
    setAdvanceRecommendation,
    approvalRemarks,
    setApprovalRemarks,
    uapcReturnRemarks,
    setUapcReturnRemarks,
    validationData,
    isValidating,
    validationError,
    previewFile,
    setPreviewFile,
    application,
    isLoading,
    error,
    currentCommittee,
    effectiveCommittee,
    isPending,
    canAct,
    canSubmitScores,
    canAdvanceOrReturn,
    isUAPC,
    submitScoresMutation,
    addCommentMutation,
    returnMutation,
    advanceMutation,
    approveMutation,
    uapcReturnMutation,
    getPerformanceBadge,
    calculatePerformanceAtWorkTotals,
    calculateKnowledgeProfessionTotals,
    calculateServiceTotals,
    getCurrentCommitteeType,
    shouldShowHouScores,
    shouldShowAapscScores,
    renderEvidenceList,
    updatePerformanceAtWorkScore,
    updateKnowledgeProfessionScore,
    updateServiceScore,
  };
}

export type ApplicationReviewContext = ReturnType<typeof useApplicationReview>;
