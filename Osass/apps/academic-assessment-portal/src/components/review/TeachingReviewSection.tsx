import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScoreBreakdown } from "@/components/review/ScoreBreakdown";
import { ScoreInputPanel } from "@osass/ui/score-input-panel";
import type { ApplicationReviewContext } from "@/hooks/useApplicationReview";

type Props = Pick<ApplicationReviewContext, 'teachingScores' | 'application' | 'canSubmitScores' | 'getPerformanceBadge' | 'getCurrentCommitteeType' | 'shouldShowDapcScores' | 'shouldShowFapcScores' | 'renderEvidenceList' | 'updateTeachingScore'>;

export function TeachingReviewSection({
  teachingScores,
  application,
  canSubmitScores,
  getPerformanceBadge,
  getCurrentCommitteeType,
  shouldShowDapcScores,
  shouldShowFapcScores,
  renderEvidenceList,
  updateTeachingScore,
}: Props) {
  return (
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
  );
}
