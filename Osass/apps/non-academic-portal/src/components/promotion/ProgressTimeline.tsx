import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type StepStatus = "completed" | "current" | "upcoming";

interface TimelineStep {
  id: string;
  label: string;
  status: StepStatus;
  date?: string;
}

interface ProgressTimelineProps {
  steps: TimelineStep[];
}

const stepConfig = {
  completed: {
    icon: CheckCircle2,
    iconClass: "text-success bg-success-light",
    lineClass: "bg-success",
    labelClass: "text-foreground font-medium",
  },
  current: {
    icon: Clock,
    iconClass: "text-primary bg-primary/10",
    lineClass: "bg-border",
    labelClass: "text-primary font-semibold",
  },
  upcoming: {
    icon: Circle,
    iconClass: "text-muted-foreground bg-muted",
    lineClass: "bg-border",
    labelClass: "text-muted-foreground",
  },
};

export const ProgressTimeline = ({ steps }: ProgressTimelineProps) => {
  return (
    <div className="space-y-0">
      {steps.map((step, index) => {
        const config = stepConfig[step.status];
        const Icon = config.icon;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex gap-4">
            {/* Icon and Line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full",
                  config.iconClass
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              {!isLast && (
                <div
                  className={cn("w-0.5 flex-1 min-h-[24px]", config.lineClass)}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn("pb-6", isLast && "pb-0")}>
              <p className={cn("text-base", config.labelClass)}>{step.label}</p>
              {step.date && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {step.date}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
