import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface GuidanceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export const GuidanceCard = ({
  icon: Icon,
  title,
  description,
  className,
  ...props
}: GuidanceCardProps) => {
  return (
    <div 
      className={cn(
        "bg-card border border-border rounded-xl p-5 transition-all duration-200",
        "hover:border-primary/20 hover:shadow-md",
        className
      )}
      {...props}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};
