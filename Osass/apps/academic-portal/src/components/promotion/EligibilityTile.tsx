import { CheckCircle2, AlertCircle, Circle, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusType = "met" | "borderline" | "not-met";

interface EligibilityTileProps {
  title: string;
  icon: LucideIcon;
  status: StatusType;
  description: string;
  value?: string;
}

const statusConfig = {
  "met": {
    icon: CheckCircle2,
    bgClass: "bg-success-light",
    borderClass: "border-success/30",
    iconClass: "text-success",
    titleClass: "text-success",
  },
  "borderline": {
    icon: AlertCircle,
    bgClass: "bg-warning-light",
    borderClass: "border-warning/30",
    iconClass: "text-warning",
    titleClass: "text-warning",
  },
  "not-met": {
    icon: Circle,
    bgClass: "bg-muted",
    borderClass: "border-border",
    iconClass: "text-muted-foreground",
    titleClass: "text-muted-foreground",
  },
};

export const EligibilityTile = ({
  title,
  icon: TileIcon,
  status,
  description,
  value,
}: EligibilityTileProps) => {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        "relative p-4 rounded-lg border transition-all duration-200 flex flex-col h-full",
        config.bgClass,
        config.borderClass,
        "hover:border-opacity-100 hover:shadow-sm"
      )}
    >
      {/* Status Icon */}
      <div className="absolute top-3 right-3">
        <StatusIcon className={cn("w-5 h-5", config.iconClass)} />
      </div>

      {/* Content */}
      <div className="flex items-start gap-3 flex-1 flex-col pr-6">
        <div className="flex items-start gap-3 w-full">
          <div className={cn("p-2 rounded-lg bg-background/70 flex-shrink-0")}>
            <TileIcon className="w-4 h-4 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn("font-semibold text-sm", config.titleClass)}>
              {title}
            </h3>
            {value && (
              <p className="text-base font-bold text-foreground mt-1 break-words">{value}</p>
            )}
          </div>
        </div>
        <p className="text-xs text-foreground/65 leading-snug flex-1">
          {description}
        </p>
      </div>
    </div>
  );
};
