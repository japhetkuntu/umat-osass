import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, AlertCircle, FileEdit, Send, FilePen } from "lucide-react";

export type ApplicationStatus =
  | "not-started"
  | "in-progress"
  | "submitted"
  | "under-review"
  | "decision-pending"
  | "approved"
  | "not-approved"
  | "returned"
  | "draft";

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<ApplicationStatus, {
  label: string;
  icon: typeof Clock;
  className: string;
}> = {
  "not-started": {
    label: "Not Started",
    icon: Clock,
    className: "bg-muted text-muted-foreground",
  },
  "in-progress": {
    label: "In Progress",
    icon: FileEdit,
    className: "bg-info-light text-info",
  },
  "submitted": {
    label: "Submitted",
    icon: Send,
    className: "bg-primary/10 text-primary",
  },
  "under-review": {
    label: "Under Review",
    icon: Clock,
    className: "bg-info-light text-info",
  },
  "decision-pending": {
    label: "Decision Pending",
    icon: Clock,
    className: "bg-warning-light text-warning",
  },
  "approved": {
    label: "Approved",
    icon: CheckCircle2,
    className: "bg-success-light text-success",
  },
  "not-approved": {
    label: "Not Approved",
    icon: AlertCircle,
    className: "bg-muted text-muted-foreground",
  },
  "returned": {
    label: "Returned for Update",
    icon: FileEdit,
    className: "bg-warning-light text-warning",
  },
  "draft": {
    label: "Draft",
    icon: FilePen,
    className: "bg-muted text-muted-foreground",
  },
};

const sizeClasses = {
  sm: "px-2.5 py-1 text-xs gap-1.5",
  md: "px-3 py-1.5 text-sm gap-2",
  lg: "px-4 py-2 text-base gap-2",
};

const iconSizes = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export const ApplicationStatusBadge = ({
  status,
  size = "md"
}: ApplicationStatusBadgeProps) => {
  // Normalize status and provide fallback
  const normalizedStatus = (status || "").toLowerCase() as ApplicationStatus;
  const config = statusConfig[normalizedStatus] || statusConfig["not-started"];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        sizeClasses[size],
        config.className
      )}
    >
      <Icon className={iconSizes[size]} />
      {config.label}
    </span>
  );
};
