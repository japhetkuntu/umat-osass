import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/common/RichTextEditor";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Send, RotateCcw, FileText } from "lucide-react";
import type { ApplicationReviewContext } from "@/hooks/useApplicationReview";

type Props = Pick<ApplicationReviewContext, 'uapcReturnDialogOpen' | 'setUapcReturnDialogOpen' | 'uapcReturnRemarks' | 'setUapcReturnRemarks' | 'isPending' | 'uapcReturnMutation'>;

export function FinalReturnDialog({
  uapcReturnDialogOpen,
  setUapcReturnDialogOpen,
  uapcReturnRemarks,
  setUapcReturnRemarks,
  isPending,
  uapcReturnMutation,
}: Props) {
  return (
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
  );
}
