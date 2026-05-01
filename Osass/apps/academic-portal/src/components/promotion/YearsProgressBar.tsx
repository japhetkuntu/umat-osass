import { cn } from "@/lib/utils";

interface YearsProgressBarProps {
  currentYears: number;
  requiredYears: number;
  className?: string;
}

export const YearsProgressBar = ({
  currentYears,
  requiredYears,
  className,
}: YearsProgressBarProps) => {
  const percentage = Math.min((currentYears / requiredYears) * 100, 100);
  const isComplete = currentYears >= requiredYears;

  const formatYears = (years: number) => {
    const fullYears = Math.floor(years);
    const months = Math.round((years - fullYears) * 12);
    
    if (months === 0) {
      return `${fullYears} ${fullYears === 1 ? 'year' : 'years'}`;
    }
    if (fullYears === 0) {
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    }
    return `${fullYears} ${fullYears === 1 ? 'year' : 'years'}, ${months} ${months === 1 ? 'month' : 'months'}`;
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-end text-sm">
        <div>
          <span className="text-muted-foreground">Your time in rank: </span>
          <span className="font-semibold text-foreground">{formatYears(currentYears)}</span>
        </div>
        <div className="text-muted-foreground">
          Required: {formatYears(requiredYears)}
        </div>
      </div>
      
      <div className="relative">
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              isComplete ? "bg-success" : "bg-primary"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Progress marker */}
        <div 
          className="absolute top-0 h-3 w-0.5 bg-foreground/20 rounded-full"
          style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
        />
      </div>
      
      <div className="text-center">
        <span className={cn(
          "text-sm font-medium",
          isComplete ? "text-success" : "text-muted-foreground"
        )}>
          {isComplete 
            ? "✓ Requirement met" 
            : `${Math.round(percentage)}% complete`
          }
        </span>
      </div>
    </div>
  );
};
