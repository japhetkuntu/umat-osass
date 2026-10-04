import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScoreBreakdown } from "@/components/review/ScoreBreakdown";
import { ScoreInputPanel } from "@osass/ui/score-input-panel";
import type { ApplicationReviewContext } from "@/hooks/useApplicationReview";

type Props = Pick<ApplicationReviewContext, 'serviceScores' | 'application' | 'canSubmitScores' | 'getPerformanceBadge' | 'getCurrentCommitteeType' | 'shouldShowHouScores' | 'shouldShowAapscScores' | 'renderEvidenceList' | 'updateServiceScore'>;

export function ServicesReviewSection({
  serviceScores,
  application,
  canSubmitScores,
  getPerformanceBadge,
  getCurrentCommitteeType,
  shouldShowHouScores,
  shouldShowAapscScores,
  renderEvidenceList,
  updateServiceScore,
}: Props) {
  return (
    <TabsContent value="services">
      <Card className="card-elevated">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>Service Records ({application.services.totalRecords})</CardTitle>
            <div className="flex flex-wrap gap-2 items-center">
              {getPerformanceBadge(application.services.applicantPerformance)}
              {shouldShowHouScores() && application.services.houPerformance && (
                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                  HOU: {application.services.houPerformance}
                </Badge>
              )}
              {shouldShowAapscScores() && application.services.aapscPerformance && (
                <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                  AAPSC: {application.services.aapscPerformance}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {application.services.universityServices.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">University Service</h4>
              <Accordion type="multiple" className="w-full">
                {application.services.universityServices.map((svc) => (
                  <AccordionItem key={svc.id} value={svc.id}>
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-start justify-between w-full pr-4 gap-4">
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-medium">{svc.serviceTitle || "N/A"}</p>
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
                          houScore={svc.houScore}
                          houRemarks={svc.houRemarks}
                          aapscScore={svc.aapscScore}
                          aapscRemarks={svc.aapscRemarks}
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
                        houScore={svc.houScore}
                        houRemarks={svc.houRemarks}
                        aapscScore={svc.aapscScore}
                        aapscRemarks={svc.aapscRemarks}
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
          {application.services.nationalInternationalServices.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">National/International Service</h4>
              <Accordion type="multiple" className="w-full">
                {application.services.nationalInternationalServices.map((svc) => (
                  <AccordionItem key={svc.id} value={svc.id}>
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-start justify-between w-full pr-4 gap-4">
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-medium">{svc.serviceTitle || "N/A"}</p>
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
                          houScore={svc.houScore}
                          houRemarks={svc.houRemarks}
                          aapscScore={svc.aapscScore}
                          aapscRemarks={svc.aapscRemarks}
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
                        houScore={svc.houScore}
                        houRemarks={svc.houRemarks}
                        aapscScore={svc.aapscScore}
                        aapscRemarks={svc.aapscRemarks}
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
  );
}
