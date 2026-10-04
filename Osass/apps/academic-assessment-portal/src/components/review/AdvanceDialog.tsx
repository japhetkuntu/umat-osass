import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Send, ArrowRight, FileText } from "lucide-react";
import type { ApplicationReviewContext } from "@/hooks/useApplicationReview";

type Props = Pick<ApplicationReviewContext, 'advanceDialogOpen' | 'setAdvanceDialogOpen' | 'advanceRecommendation' | 'setAdvanceRecommendation' | 'application' | 'isPending' | 'advanceMutation'>;

export function AdvanceDialog({
  advanceDialogOpen,
  setAdvanceDialogOpen,
  advanceRecommendation,
  setAdvanceRecommendation,
  application,
  isPending,
  advanceMutation,
}: Props) {
  return (
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
  );
}
