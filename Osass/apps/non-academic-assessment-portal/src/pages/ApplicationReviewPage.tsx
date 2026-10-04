import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, User, BookOpen, Briefcase, AlertCircle, History, MessageSquare, FileText, Save, Award, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { FilePreviewModal } from "@/components/common/FilePreviewModal";
import { PerformanceCell } from "@/components/review/PerformanceCell";
import { PerformanceReviewSection } from "@/components/review/PerformanceReviewSection";
import { KnowledgeReviewSection } from "@/components/review/KnowledgeReviewSection";
import { ServicesReviewSection } from "@/components/review/ServicesReviewSection";
import { ActivityTimeline } from "@/components/review/ActivityTimeline";
import { useApplicationReview } from "@/hooks/useApplicationReview";
import { ApprovalDialog } from "@/components/review/ApprovalDialog";
import { FinalReturnDialog } from "@/components/review/FinalReturnDialog";
import { AdvanceDialog } from "@/components/review/AdvanceDialog";
import { ReturnDialog } from "@/components/review/ReturnDialog";

export default function ApplicationReviewPage() {
  const review = useApplicationReview();
  const {
    navigate,
    user,
    overallRemarks,
    setOverallRemarks,
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
    calculatePerformanceAtWorkTotals,
    calculateKnowledgeProfessionTotals,
    calculateServiceTotals,
  } = review;


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
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
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
                  <Label className="text-muted-foreground">Department/Unit</Label>
                  <p>{application.unitName}</p>
                </div>
              </CardContent>
            </Card>

            {/* Assessment Tabs */}
            <Tabs defaultValue="performance" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="performance" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Performance at Work
                </TabsTrigger>
                <TabsTrigger value="knowledge" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Knowledge & Profession
                </TabsTrigger>
                <TabsTrigger value="services" className="gap-2">
                  <Briefcase className="h-4 w-4" />
                  Services
                </TabsTrigger>
              </TabsList>

              {/* Performance at Work Tab */}
              <PerformanceReviewSection {...review} />

              {/* Knowledge & Profession Tab */}
              <KnowledgeReviewSection {...review} />

              {/* Services Tab */}
              <ServicesReviewSection {...review} />
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
                      placeholder="E.g., 'Performance at Work assessment shows strong performance across all categories. Knowledge & Profession are well-documented with adequate evidence. Service records require additional verification...'"
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
                        ? <>This application is not pending. Only submitted (pending) applications can be assessed.</>
                        : currentCommittee
                          ? <>Only the <span className="font-semibold">{currentCommittee.committeeType}</span> chairperson can submit scores or take action on this application. You can still add comments below.</>
                          : <>This application is currently at <span className="font-semibold">{application?.reviewStatus}</span> stage and is not assigned to your committee.</>}
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
                  {/* Performance at Work Performance Row */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded">
                        <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-semibold text-sm">Performance at Work</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      <PerformanceCell 
                        label="Self" 
                        value={application.performanceAtWork.applicantPerformance} 
                        score={calculatePerformanceAtWorkTotals().self}
                        color="slate"
                      />
                      <PerformanceCell 
                        label="HOU" 
                        value={application.performanceAtWork.houPerformance} 
                        score={calculatePerformanceAtWorkTotals().dapc}
                        color="blue"
                      />
                      <PerformanceCell 
                        label="AAPSC" 
                        value={application.performanceAtWork.aapscPerformance} 
                        score={calculatePerformanceAtWorkTotals().fapsc}
                        color="purple"
                      />
                      <PerformanceCell 
                        label="UAPC" 
                        value={application.performanceAtWork.uapcPerformance} 
                        score={calculatePerformanceAtWorkTotals().uapc}
                        color="emerald"
                        isFinal
                      />
                    </div>
                  </div>

                  {/* Knowledge & Profession Performance Row */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded">
                        <FileText className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="font-semibold text-sm">Knowledge & Profession</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      <PerformanceCell 
                        label="Self" 
                        value={application.knowledgeProfession.applicantPerformance} 
                        score={calculateKnowledgeProfessionTotals().self}
                        color="slate"
                      />
                      <PerformanceCell 
                        label="HOU" 
                        value={application.knowledgeProfession.houPerformance} 
                        score={calculateKnowledgeProfessionTotals().dapc}
                        color="blue"
                      />
                      <PerformanceCell 
                        label="AAPSC" 
                        value={application.knowledgeProfession.aapscPerformance}
                        score={calculateKnowledgeProfessionTotals().fapsc}
                        color="purple"
                      />
                      <PerformanceCell 
                        label="UAPC" 
                        value={application.knowledgeProfession.uapcPerformance}
                        score={calculateKnowledgeProfessionTotals().uapc}
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
                        label="HOU" 
                        value={application.services.houPerformance}
                        score={calculateServiceTotals().dapc}
                        color="blue"
                      />
                      <PerformanceCell 
                        label="AAPSC" 
                        value={application.services.aapscPerformance}
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
                            ? <>Application is not pending. Only submitted (pending) applications can be acted upon.</>
                            : currentCommittee
                              ? <>Only the <span className="font-semibold">{currentCommittee.committeeType}</span> chairperson can take action on this application.</>
                              : <>Application is at <span className="font-semibold">{application?.reviewStatus}</span> stage and is not assigned to your committee.</>}
                        </p>
                      </div>
                    </div>
                  ) : isUAPC ? (
                    <>
                      {/* UAPC: Approve Promotion */}
                      <ApprovalDialog {...review} />

                      {/* UAPC: Return for Update */}
                      <FinalReturnDialog {...review} />
                    </>
                  ) : (
                    <>
                      {/* HOU/AAPSC: Advance to Next Stage */}
                      <AdvanceDialog {...review} />

                      {/* HOU/AAPSC: Return to Applicant */}
                      <ReturnDialog {...review} />
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Previous Assessments */}
            {application.previousAssessments?.length > 0 && (
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
                      {application.previousAssessments?.map((assessment, index) => (
                        <div key={index} className="p-4 bg-muted/50 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <Badge 
                              variant="outline" 
                              className={
                                assessment.committeeLevel === "HOU" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                assessment.committeeLevel === "AAPSC" ? "bg-purple-50 text-purple-700 border-purple-200" :
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
            <ActivityTimeline {...review} />
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
