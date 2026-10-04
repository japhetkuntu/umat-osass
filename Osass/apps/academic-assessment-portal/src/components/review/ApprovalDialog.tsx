import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, CheckCircle2, AlertCircle, MinusCircle, Award } from "lucide-react";
import type { ApplicationReviewContext } from "@/hooks/useApplicationReview";

type Props = Pick<ApplicationReviewContext, 'approveDialogOpen' | 'setApproveDialogOpen' | 'approvalRemarks' | 'setApprovalRemarks' | 'validationData' | 'isValidating' | 'validationError' | 'application' | 'isPending' | 'approveMutation'>;

export function ApprovalDialog({
  approveDialogOpen,
  setApproveDialogOpen,
  approvalRemarks,
  setApprovalRemarks,
  validationData,
  isValidating,
  validationError,
  application,
  isPending,
  approveMutation,
}: Props) {
  return (
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
  );
}
