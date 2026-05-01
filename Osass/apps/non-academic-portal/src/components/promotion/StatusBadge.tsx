import { CheckCircle2, AlertCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusType = "met" | "borderline" | "not-met" | "not-started" | "in-progress" | "submitted";

interface StatusBadgeProps {
  status: StatusType;
  size?: "sm" | "md" | "lg";
}

const statusConfig = {
  "met": {
    label: "Met",
    icon: CheckCircle2,
    className: "bg-success-light text-success border-success/20",
  },
  "borderline": {
    label: "Borderline",
    icon: AlertCircle,
    className: "bg-warning-light text-warning border-warning/20",
  },
  "not-met": {
    label: "Not Met",
    icon: Circle,
    className: "bg-muted text-muted-foreground border-border",
  },
  "not-started": {
    label: "Not Started",
    icon: Circle,
    className: "bg-muted text-muted-foreground border-border",
  },
  "in-progress": {
    label: "In Progress",
    icon: AlertCircle,
    className: "bg-info-light text-info border-info/20",
  },
  "submitted": {
    label: "Submitted",
    icon: CheckCircle2,
    className: "bg-success-light text-success border-success/20",
  },
};

export const StatusBadge = ({ status, size = "md" }: StatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        config.className,
        sizeClasses[size]
      )}
    >
      <Icon className={iconSizes[size]} />
      {config.label}
    </span>
  );
};
