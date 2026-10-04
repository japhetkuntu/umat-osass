import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, MinusCircle } from "lucide-react";

export const ScoreBreakdown = ({
    applicantScore,
    houScore,
    houRemarks,
    aapscScore,
    aapscRemarks,
    uapcScore,
    uapcRemarks,
    systemScore,
    compact = false,
  }: {
    applicantScore?: number;
    houScore?: number;
    houRemarks?: string;
    aapscScore?: number;
    aapscRemarks?: string;
    uapcScore?: number;
    uapcRemarks?: string;
    systemScore?: number;
    compact?: boolean;
  }) => {
    const scores = [
      { 
        label: 'Applicant', 
        abbrev: 'Self',
        score: applicantScore ?? systemScore, 
        remarks: null,
        color: 'slate',
        bgClass: 'bg-slate-100 dark:bg-slate-800',
        textClass: 'text-slate-700 dark:text-slate-300',
        borderClass: 'border-slate-200 dark:border-slate-700',
        dotClass: 'bg-slate-400',
      },
      { 
        label: 'HOU', 
        abbrev: 'HOU',
        score: houScore, 
        remarks: houRemarks,
        color: 'blue',
        bgClass: 'bg-blue-50 dark:bg-blue-900/30',
        textClass: 'text-blue-700 dark:text-blue-300',
        borderClass: 'border-blue-200 dark:border-blue-700',
        dotClass: 'bg-blue-500',
      },
      { 
        label: 'AAPSC', 
        abbrev: 'AAPSC',
        score: aapscScore, 
        remarks: aapscRemarks,
        color: 'purple',
        bgClass: 'bg-purple-50 dark:bg-purple-900/30',
        textClass: 'text-purple-700 dark:text-purple-300',
        borderClass: 'border-purple-200 dark:border-purple-700',
        dotClass: 'bg-purple-500',
      },
      { 
        label: 'UAPC', 
        abbrev: 'UAPC',
        score: uapcScore, 
        remarks: uapcRemarks,
        color: 'emerald',
        bgClass: 'bg-emerald-50 dark:bg-emerald-900/30',
        textClass: 'text-emerald-700 dark:text-emerald-300',
        borderClass: 'border-emerald-200 dark:border-emerald-700',
        dotClass: 'bg-emerald-500',
      },
    ];

    if (compact) {
      // Compact inline display for accordion headers
      return (
        <div className="flex items-center gap-1">
          {scores.map((s, i) => (
            <TooltipProvider key={s.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={`
                      flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all
                      ${s.score !== null && s.score !== undefined 
                        ? `${s.bgClass} ${s.textClass} border ${s.borderClass}` 
                        : 'bg-muted/40 text-muted-foreground/50 border border-dashed border-muted-foreground/20'
                      }
                    `}
                  >
                    <span className="opacity-70">{s.abbrev}</span>
                    <span className="font-bold">{s.score ?? '—'}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-semibold">{s.label}</p>
                  {s.score !== null && s.score !== undefined ? (
                    <>
                      <p className="text-sm">Score: {s.score}</p>
                      {s.remarks && <p className="text-xs text-muted-foreground mt-1">{s.remarks}</p>}
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">Not yet assessed</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      );
    }

    // Full display with timeline for expanded content
    return (
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assessment Scores</p>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-slate-300 via-blue-300 via-purple-300 to-emerald-300 dark:from-slate-600 dark:via-blue-600 dark:via-purple-600 dark:to-emerald-600" />
          
          <div className="space-y-2">
            {scores.map((s, index) => {
              const hasScore = s.score !== null && s.score !== undefined;
              return (
                <div key={s.label} className="flex items-start gap-3 relative">
                  {/* Timeline dot */}
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2
                    ${hasScore 
                      ? `${s.bgClass} ${s.borderClass}` 
                      : 'bg-background border-dashed border-muted-foreground/30'
                    }
                  `}>
                    {hasScore ? (
                      <CheckCircle2 className={`h-3 w-3 ${s.textClass}`} />
                    ) : (
                      <MinusCircle className="h-3 w-3 text-muted-foreground/40" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className={`
                    flex-1 rounded-lg p-3 border transition-all
                    ${hasScore 
                      ? `${s.bgClass} ${s.borderClass}` 
                      : 'bg-muted/20 border-dashed border-muted-foreground/20'
                    }
                  `}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold uppercase tracking-wider ${hasScore ? s.textClass : 'text-muted-foreground/50'}`}>
                        {s.label}
                      </span>
                      <span className={`text-lg font-bold ${hasScore ? s.textClass : 'text-muted-foreground/40'}`}>
                        {hasScore ? s.score : '—'}
                      </span>
                    </div>
                    {s.remarks && hasScore && (
                      <p className={`text-xs mt-1.5 ${s.textClass} opacity-80`}>
                        {s.remarks}
                      </p>
                    )}
                    {!hasScore && (
                      <p className="text-xs text-muted-foreground/50 mt-0.5">
                        Awaiting assessment
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

