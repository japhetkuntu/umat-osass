import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/common/RichTextEditor";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Send, RotateCcw, FileText } from "lucide-react";
import type { ApplicationReviewContext } from "@/hooks/useApplicationReview";

type Props = Pick<ApplicationReviewContext, 'returnDialogOpen' | 'setReturnDialogOpen' | 'returnReason' | 'setReturnReason' | 'returnDetails' | 'setReturnDetails' | 'application' | 'isPending' | 'returnMutation'>;

export function ReturnDialog({
  returnDialogOpen,
  setReturnDialogOpen,
  returnReason,
  setReturnReason,
  returnDetails,
  setReturnDetails,
  application,
  isPending,
  returnMutation,
}: Props) {
  return (
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
  );
}
