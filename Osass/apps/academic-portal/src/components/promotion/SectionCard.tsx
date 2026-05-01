import { ChevronRight, LucideIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressRing } from "./ProgressRing";

type CompletionLevel = "not-started" | "partial" | "complete";
type PerformanceLevel = "high" | "good" | "adequate" | "none";

interface SectionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  completion: CompletionLevel;
  performance?: PerformanceLevel;
  itemCount?: number;
  totalItems?: number;
  onClick: () => void;
}

const completionConfig = {
  "not-started": {
    label: "Not started",
    className: "bg-muted text-muted-foreground",
    progress: 0,
  },
  "partial": {
    label: "In progress",
    className: "bg-info-light text-info",
    progress: 50,
  },
  "complete": {
    label: "Complete",
    className: "bg-success-light text-success",
    progress: 100,
  },
};

const performanceConfig = {
  "high": { label: "High", className: "text-success", emoji: "🌟" },
  "good": { label: "Good", className: "text-success", emoji: "✨" },
  "adequate": { label: "Adequate", className: "text-warning", emoji: "📈" },
  "none": { label: "—", className: "text-muted-foreground", emoji: "" },
};

export const SectionCard = ({
  title,
  description,
  icon: Icon,
  completion,
  performance = "none",
  itemCount,
  totalItems = 10,
  onClick,
}: SectionCardProps) => {
  const completionInfo = completionConfig[completion];
  const performanceInfo = performanceConfig[performance];
  const progress = itemCount !== undefined ? (itemCount / totalItems) * 100 : completionInfo.progress;

  return (
    <button
      onClick={onClick}
      className="card-interactive w-full text-left p-6 group relative overflow-hidden"
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-start gap-4">
        {/* Icon with progress ring */}
        <div className="relative">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary group-hover:from-primary group-hover:to-primary-glow group-hover:text-primary-foreground transition-all duration-300 shadow-sm group-hover:shadow-md">
            {completion === "complete" ? (
              <Check className="w-7 h-7" />
            ) : (
              <Icon className="w-6 h-6" />
            )}
          </div>
          {/* Mini progress indicator */}
          {completion !== "not-started" && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background shadow-sm flex items-center justify-center">
              <div className={cn(
                "w-3 h-3 rounded-full",
                completion === "complete" ? "bg-success" : "bg-info"
              )} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
            </div>
            
            {/* Progress ring on large screens */}
            <div className="hidden sm:flex items-center gap-3">
              <ProgressRing 
                progress={progress} 
                size={48} 
                strokeWidth={4}
                showLabel={false}
              />
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
            
            {/* Arrow only on small screens */}
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 sm:hidden mt-1" />
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-4">
            <span
              className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-full transition-colors",
                completionInfo.className
              )}
            >
              {completionInfo.label}
            </span>
            {performance !== "none" && (
              <span className={cn("text-sm font-medium flex items-center gap-1", performanceInfo.className)}>
                {performanceInfo.emoji} {performanceInfo.label}
              </span>
            )}
            {itemCount !== undefined && (
              <span className="text-sm text-muted-foreground">
                {itemCount} / {totalItems}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};
