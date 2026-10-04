import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScoreBreakdown } from "@/components/review/ScoreBreakdown";
import { ScoreInputPanel } from "@osass/ui/score-input-panel";
import type { ApplicationReviewContext } from "@/hooks/useApplicationReview";

type Props = Pick<ApplicationReviewContext, 'knowledgeProfessionScores' | 'application' | 'canSubmitScores' | 'getPerformanceBadge' | 'getCurrentCommitteeType' | 'shouldShowHouScores' | 'shouldShowAapscScores' | 'renderEvidenceList' | 'updateKnowledgeProfessionScore'>;

export function KnowledgeReviewSection({
  knowledgeProfessionScores,
  application,
  canSubmitScores,
  getPerformanceBadge,
  getCurrentCommitteeType,
  shouldShowHouScores,
  shouldShowAapscScores,
  renderEvidenceList,
  updateKnowledgeProfessionScore,
}: Props) {
  return (
    <TabsContent value="knowledge">
      <Card className="card-elevated">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>Knowledge & Profession ({application.knowledgeProfession.totalMaterials})</CardTitle>
            <div className="flex flex-wrap gap-2 items-center">
              {getPerformanceBadge(application.knowledgeProfession.applicantPerformance)}
              {shouldShowHouScores() && application.knowledgeProfession.houPerformance && (
                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                  HOU: {application.knowledgeProfession.houPerformance}
                </Badge>
              )}
              {shouldShowAapscScores() && application.knowledgeProfession.aapscPerformance && (
                <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                  AAPSC: {application.knowledgeProfession.aapscPerformance}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {application.knowledgeProfession.materials.map((pub) => (
              <AccordionItem key={pub.id} value={pub.id}>
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-start justify-between w-full pr-4 gap-4">
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium truncate">{pub.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{pub.materialTypeName || "N/A"}</Badge>
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
                      systemScore={pub.systemGeneratedScore}
                      houScore={pub.houScore}
                      houRemarks={pub.houRemarks}
                      aapscScore={pub.aapscScore}
                      aapscRemarks={pub.aapscRemarks}
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
                    systemScore={pub.systemGeneratedScore}
                    houScore={pub.houScore}
                    houRemarks={pub.houRemarks}
                    aapscScore={pub.aapscScore}
                    aapscRemarks={pub.aapscRemarks}
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
                          <span className="text-[10px] text-emerald-700 font-semibold">Base: {pub.systemGeneratedScore - (pub.presentationBonus || 0)}</span>
                          <span className="text-emerald-300">+</span>
                          <span className="text-[10px] text-emerald-700 font-bold">{pub.presentationBonus || 0} Bonus</span>
                          <span className="text-emerald-300">=</span>
                          <span className="text-sm font-bold text-emerald-800">{pub.systemGeneratedScore}</span>
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
                      currentScore={knowledgeProfessionScores[pub.id]?.score}
                      onScoreChange={(score) => updateKnowledgeProfessionScore(pub.id, score)}
                      remarks={knowledgeProfessionScores[pub.id]?.remarks}
                      onRemarksChange={(remarks) =>
                        updateKnowledgeProfessionScore(
                          pub.id,
                          knowledgeProfessionScores[pub.id]?.score || 0,
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
