

export const PerformanceCell = ({ 
    label, 
    value, 
    score,
    color, 
    isFinal = false 
  }: { 
    label: string; 
    value?: string; 
    score?: number;
    color: 'slate' | 'blue' | 'purple' | 'emerald'; 
    isFinal?: boolean;
  }) => {
    const getPerformanceColor = (perf?: string) => {
      if (!perf) return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
      const colors: Record<string, string> = {
        High: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700',
        Good: 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700',
        Adequate: 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700',
        InAdequate: 'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700',
      };
      return colors[perf] || 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    };

    const getTextColor = (perf?: string) => {
      if (!perf) return 'text-muted-foreground';
      const colors: Record<string, string> = {
        High: 'text-emerald-700 dark:text-emerald-300',
        Good: 'text-blue-700 dark:text-blue-300',
        Adequate: 'text-amber-700 dark:text-amber-300',
        InAdequate: 'text-red-700 dark:text-red-300',
      };
      return colors[perf] || 'text-foreground';
    };

    const labelColors: Record<string, string> = {
      slate: 'text-slate-500',
      blue: 'text-blue-600 dark:text-blue-400',
      purple: 'text-purple-600 dark:text-purple-400',
      emerald: 'text-emerald-600 dark:text-emerald-400',
    };

    return (
      <div className={`text-center rounded-lg border p-2 transition-all ${getPerformanceColor(value)} ${isFinal && value ? 'ring-2 ring-emerald-400/50 ring-offset-1' : ''}`}>
        <p className={`text-[9px] uppercase tracking-wider font-bold mb-0.5 ${labelColors[color]}`}>
          {label}
        </p>
        {score !== undefined && score > 0 ? (
          <p className={`text-sm font-bold ${getTextColor(value)}`}>
            {score.toFixed(1)}
          </p>
        ) : null}
        <p className={`text-[10px] font-medium truncate ${getTextColor(value)}`}>
          {value || '—'}
        </p>
      </div>
    );
  };

