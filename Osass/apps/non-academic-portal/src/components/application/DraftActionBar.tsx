import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, X, Send, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DraftActionBarProps {
  onSave?: () => void;
  onSubmit?: () => void;
  showSubmit?: boolean;
  className?: string;
}

export const DraftActionBar = ({
  onSave,
  onSubmit,
  showSubmit = false,
  className,
}: DraftActionBarProps) => {
  const navigate = useNavigate();
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("saved");
  const [lastSaved, setLastSaved] = useState<Date>(new Date());

  // Simulate auto-save on changes (in real app, this would be triggered by actual changes)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate periodic auto-save
      setSaveState("saving");
      setTimeout(() => {
        setSaveState("saved");
        setLastSaved(new Date());
      }, 800);
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleManualSave = () => {
    setSaveState("saving");
    setTimeout(() => {
      setSaveState("saved");
      setLastSaved(new Date());
      onSave?.();
    }, 600);
  };

  const handleExit = () => {
    // Trigger save before exit
    setSaveState("saving");
    setTimeout(() => {
      setSaveState("saved");
      navigate("/dashboard");
    }, 400);
  };

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background/95 backdrop-blur-md border-t border-border",
        "shadow-[0_-4px_20px_rgba(0,0,0,0.08)]",
        className
      )}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Draft Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              {saveState === "saving" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground">Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-muted-foreground">
                    Draft saved • {formatLastSaved(lastSaved)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualSave}
              disabled={saveState === "saving"}
              className="flex-1 sm:flex-none"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExit}
              className="flex-1 sm:flex-none"
            >
              <X className="w-4 h-4 mr-2" />
              Exit Draft
            </Button>

            {showSubmit && (
              <Button
                variant="hero"
                size="sm"
                onClick={() => {
                  handleManualSave();
                  onSubmit?.();
                }}
                className="flex-1 sm:flex-none"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Application
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
