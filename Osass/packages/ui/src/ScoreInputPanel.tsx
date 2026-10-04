import { useId } from "react";
import { Input } from "./input";
import { Label } from "./label";

export const ScoreInputPanel = ({
  currentScore,
  maxScore,
  onScoreChange,
  remarks,
  onRemarksChange,
  label = "Your Assessment",
  committeeType = "DAPC",
}: {
  currentScore?: number;
  maxScore?: number;
  onScoreChange: (score: number) => void;
  remarks?: string;
  onRemarksChange: (remarks: string) => void;
  label?: string;
  committeeType?: string;
}) => {
  const committeeColors = {
    DAPC: { bg: 'from-blue-500 to-blue-600', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' },
    HOU: { bg: 'from-blue-500 to-blue-600', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' },
    AAPSC: { bg: 'from-purple-500 to-purple-600', text: 'text-purple-600', border: 'border-purple-200', light: 'bg-purple-50' },
    FAPSC: { bg: 'from-purple-500 to-purple-600', text: 'text-purple-600', border: 'border-purple-200', light: 'bg-purple-50' },
    UAPC: { bg: 'from-emerald-500 to-emerald-600', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50' },
  };
  const colors = committeeColors[committeeType as keyof typeof committeeColors] || committeeColors.DAPC;
  const scoreId = useId();
  const remarksId = useId();

  return (
    <div className={`mt-4 p-4 rounded-xl border-2 ${colors.border} ${colors.light} dark:bg-opacity-20`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${colors.bg}`} />
        <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
          {label} ({committeeType})
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={scoreId} className="text-sm font-semibold flex items-center gap-2">
            <span>Score</span>
            {maxScore && (
              <span className="text-xs font-normal text-muted-foreground">(max: {maxScore})</span>
            )}
          </Label>
          <div className="relative">
            <Input
              id={scoreId}
              type="number"
              step="0.5"
              min="0"
              max={maxScore}
              placeholder="0.0"
              value={currentScore ?? ""}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                  onScoreChange(Math.min(value, maxScore || Infinity));
                } else if (e.target.value === "") {
                  onScoreChange(0);
                }
              }}
              className={`text-lg font-bold h-12 pr-12 ${colors.border} focus:ring-2 focus:ring-offset-1`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
              pts
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={remarksId} className="text-sm font-semibold">Remarks</Label>
          <Input
            id={remarksId}
            placeholder="Add assessment remarks..."
            value={remarks || ""}
            onChange={(e) => onRemarksChange(e.target.value)}
            className={`h-12 ${colors.border}`}
          />
        </div>
      </div>
    </div>
  );
};

