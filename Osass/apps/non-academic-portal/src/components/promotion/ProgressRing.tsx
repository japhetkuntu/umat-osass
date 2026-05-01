import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export const ProgressRing = ({
  progress,
  size = 64,
  strokeWidth = 4,
  className,
  showLabel = true,
  label,
}: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  // Determine color based on progress
  const getColor = () => {
    if (progress >= 100) return "text-success";
    if (progress >= 50) return "text-primary";
    return "text-muted-foreground";
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        className="progress-ring transform -rotate-90"
        width={size}
        height={size}
      >
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--secondary))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background circle */}
        <circle
          className="text-muted/30 stroke-current"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className={cn("progress-ring__circle transition-all duration-1000 ease-in-out")}
          stroke="url(#progress-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            filter: "url(#glow)",
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <span className={cn("text-4xl font-bold text-primary tracking-tighter")}>
            {Math.round(progress)}
            <span className="text-sm align-top mt-2 ml-0.5">%</span>
          </span>
          {label && (
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-black mt-1">{label}</span>
          )}
        </div>
      )}
    </div>
  );
};
