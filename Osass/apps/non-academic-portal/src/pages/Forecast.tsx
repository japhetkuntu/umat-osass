import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { nonAcademicService } from "@/services/nonAcademicService";
import { EligibilityForecastResponse, PromotionMilestone } from "@/types/forecast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, X, Lock, ArrowRight, ChevronRight } from "lucide-react";
import { HelpTip } from "@/components/common/HelpTip";
import { toast } from "sonner";
import { format } from "date-fns";

const CRITERIA_LEVEL: Record<string, number> = {
  high: 4,
  good: 3,
  adequate: 2,
  inadequate: 1,
};

const CRITERIA_COLORS: Record<string, string> = {
  high:       "bg-emerald-500  text-white          border-emerald-600  shadow-sm shadow-emerald-200  dark:shadow-emerald-900/40",
  good:       "bg-sky-500      text-white          border-sky-600      shadow-sm shadow-sky-200      dark:shadow-sky-900/40",
  adequate:   "bg-amber-400    text-amber-950      border-amber-500    shadow-sm shadow-amber-200    dark:shadow-amber-900/40",
  inadequate: "bg-rose-500     text-white          border-rose-600     shadow-sm shadow-rose-200     dark:shadow-rose-900/40",
};

function criteriaColor(value: string) {
  return CRITERIA_COLORS[value.toLowerCase()] ?? "bg-muted text-muted-foreground border-border";
}

function parseCriteria(option: string): string[] {
  return option.split(",").map((v) => v.trim());
}

function fmtDate(d?: string | null): string {
  if (!d) return "";
  try { return format(new Date(d), "MMMM yyyy"); } catch { return d; }
}

const Forecast = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [forecast, setForecast] = useState<EligibilityForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await nonAcademicService.getEligibilityForecast();
        if (res.success) setForecast(res.data);
        else toast.error(res.message ?? "Failed to load forecast");
      } catch {
        toast.error("Unable to load promotion roadmap.");
      } finally {
        setIsLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  if (isLoading) {
    return (
      <div className="space-y-4 pb-20">
        <div className="h-7 w-52 bg-muted animate-pulse rounded" />
        <div className="h-4 w-80 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mt-6">
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="lg:col-span-3 space-y-3">
            <div className="h-60 bg-muted animate-pulse rounded-lg" />
            <div className="h-20 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="space-y-4 pb-20">
        <p className="text-muted-foreground">Unable to load your promotion roadmap. Please refresh the page.</p>
      </div>
    );
  }

  const isEligible = !!forecast.nextEligibleMilestone;

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-5 border-b border-border">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
            Career Development
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Promotion Roadmap</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Track your requirements and timeline for each upcoming position level.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 pt-1">
          <Button variant="outline" size="sm" onClick={() => navigate("/guidelines")}>
            Guidelines
          </Button>
          <Button size="sm" onClick={() => navigate("/application")}>
            {isEligible ? "Begin Application" : "My Application"}
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>

      {/* Two-column: info sidebar + milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Info sidebar */}
        <div className="space-y-3">
          <div className="rounded-lg border bg-card px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Current Position
            </p>
            <p className="font-semibold text-sm">{forecast.currentPosition}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Since {fmtDate(forecast.lastPromotionDate)}
            </p>
          </div>

          {forecast.nextEligibleMilestone ? (
            <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
                Eligible For
              </p>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                {forecast.nextEligibleMilestone.targetPosition}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                All requirements met
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-1">
                Status
              </p>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Not Yet Eligible
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                Complete the requirements below
              </p>
            </div>
          )}
        </div>

        {/* Milestones */}
        <div className="lg:col-span-3 space-y-3">
          {forecast.milestones.length === 0 ? (
            <div className="rounded-lg border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                You have reached the highest position configured in this system.
              </p>
            </div>
          ) : (
            forecast.milestones.map((m, i) => (
              <MilestoneCard key={i} milestone={m} index={i} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const MilestoneCard = ({ milestone, index }: { milestone: PromotionMilestone; index: number }) => {
  if (milestone.isLocked) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <Lock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-muted-foreground">
                {milestone.targetPosition}
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                You must complete promotion to{" "}
                <span className="font-semibold text-foreground/70">{milestone.previousPosition}</span>{" "}
                before this position becomes available. Positions cannot be skipped.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2 py-1 rounded bg-muted text-muted-foreground border border-border flex-shrink-0 whitespace-nowrap uppercase tracking-wide">
            Locked
          </span>
        </div>
      </div>
    );
  }

  const tenureMet = milestone.currentYearsInRank >= milestone.minimumYearsRequired;
  const pubsMet = milestone.hasUploadedData && milestone.knowledgeMaterialsGap === 0;
  const refsMet = milestone.minimumJournals === 0 || (milestone.hasUploadedData && milestone.journalsGap === 0);
  const readyToApply = tenureMet && pubsMet && refsMet;

  const tenurePct = milestone.minimumYearsRequired > 0
    ? Math.min(100, (milestone.currentYearsInRank / milestone.minimumYearsRequired) * 100)
    : 100;

  const pubsPct = milestone.minimumKnowledgeMaterials > 0
    ? Math.min(100, (milestone.currentKnowledgeMaterials / milestone.minimumKnowledgeMaterials) * 100)
    : 100;

  const refsPct = milestone.minimumJournals > 0
    ? Math.min(100, (milestone.currentJournals / milestone.minimumJournals) * 100)
    : 100;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Next Position
          </p>
          <p className="text-base font-semibold mt-0.5">{milestone.targetPosition}</p>
        </div>
        {readyToApply ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex-shrink-0 whitespace-nowrap">
            <Check className="w-3 h-3" />
            Eligible to Apply
          </span>
        ) : (
          <span className="inline-flex items-center text-xs font-medium px-2.5 py-1.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex-shrink-0 whitespace-nowrap">
            Requirements Pending
          </span>
        )}
      </div>

      {/* Requirements */}
      <div className="divide-y divide-border">
        {/* Tenure */}
        <div className="px-5 py-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            Minimum Time in Rank
            <HelpTip tip="The number of years you must hold your current rank before you can be considered for the next promotion." />
          </p>
          <Req
            met={tenureMet}
            label={`${milestone.minimumYearsRequired} year${milestone.minimumYearsRequired !== 1 ? "s" : ""} in ${milestone.previousPosition}`}
            status={
              tenureMet
                ? `${milestone.currentYearsInRank} year${milestone.currentYearsInRank !== 1 ? "s" : ""} served · Requirement met`
                : `${milestone.currentYearsInRank} of ${milestone.minimumYearsRequired} years served${milestone.estimatedEligibilityDate ? ` · Eligible from ${fmtDate(milestone.estimatedEligibilityDate)}` : ""}`
            }
            pct={tenurePct}
          />
        </div>

        {/* Research Output */}
        <div className="px-5 py-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            Knowledge & Profession
            <HelpTip tip="The minimum number of knowledge materials and journal articles required for this target rank. Only materials you have uploaded for this specific position are counted here." />
          </p>
          {milestone.hasUploadedData ? (
            <>
              <Req
                met={pubsMet}
                label={`${milestone.minimumKnowledgeMaterials} total material${milestone.minimumKnowledgeMaterials !== 1 ? "s" : ""}`}
                status={
                  pubsMet
                    ? `${milestone.currentKnowledgeMaterials} material${milestone.currentKnowledgeMaterials !== 1 ? "s" : ""} on record · Requirement met`
                    : `${milestone.currentKnowledgeMaterials} of ${milestone.minimumKnowledgeMaterials} · ${milestone.knowledgeMaterialsGap} more required`
                }
                pct={pubsPct}
              />
              {milestone.minimumJournals > 0 && (
                <Req
                  met={refsMet}
                  label={`${milestone.minimumJournals} journal article${milestone.minimumJournals !== 1 ? "s" : ""}`}
                  status={
                    refsMet
                      ? `${milestone.currentJournals} journal article${milestone.currentJournals !== 1 ? "s" : ""} on record · Requirement met`
                      : `${milestone.currentJournals} of ${milestone.minimumJournals} · ${milestone.journalsGap} more required`
                  }
                  pct={refsPct}
                />
              )}
            </>
          ) : (
            <div className="rounded border border-dashed border-border px-3 py-3 space-y-1.5">
              <p className="text-[13px] text-muted-foreground">
                No records uploaded for this position yet. Knowledge materials and service records you add to your application will be reflected here.
              </p>
              <p className="text-xs text-muted-foreground">
                Required:{" "}
                <span className="font-medium text-foreground/80">
                  {milestone.minimumKnowledgeMaterials} material{milestone.minimumKnowledgeMaterials !== 1 ? "s" : ""}
                  {milestone.minimumJournals > 0
                    ? `, including ${milestone.minimumJournals} journal article${milestone.minimumJournals !== 1 ? "s" : ""}`
                    : ""}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Performance Criteria */}
        {milestone.performanceCriteriaOptions.length > 0 && (
          <div className="px-5 py-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              Performance Assessment
              <HelpTip tip="One of these score combinations across your performance assessment must be met. Each option shows the minimum required level for each category (e.g. High, Good, Adequate)." />
            </p>
            <p className="text-xs text-muted-foreground">
              One of the following assessment combinations must be attained:
            </p>
            <div className="space-y-2 pt-1">
              {milestone.performanceCriteriaOptions.map((option, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-14 flex-shrink-0">
                    Option {idx + 1}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {parseCriteria(option).map((value, i, arr) => {
                      const level = CRITERIA_LEVEL[value.toLowerCase()] ?? 0;
                      const dots = Math.min(level, 4);
                      return (
                        <span key={i} className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border",
                              criteriaColor(value)
                            )}
                          >
                            <span className="flex gap-0.5">
                              {Array.from({ length: 4 }).map((_, d) => (
                                <span
                                  key={d}
                                  className={cn(
                                    "w-1 h-1 rounded-full",
                                    d < dots ? "bg-current opacity-90" : "bg-current opacity-20"
                                  )}
                                />
                              ))}
                            </span>
                            {value}
                          </span>
                          {i < arr.length - 1 && (
                            <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Req = ({
  met,
  label,
  status,
  pct,
}: {
  met: boolean;
  label: string;
  status: string;
  pct: number;
}) => (
  <div className="space-y-2">
    <div className="flex items-start gap-2.5">
      <div
        className={cn(
          "mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border",
          met ? "bg-emerald-600 border-emerald-600 text-white" : "bg-background border-border"
        )}
      >
        {met ? (
          <Check className="w-3 h-3" />
        ) : (
          <X className="w-2.5 h-2.5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p
          className={cn(
            "text-xs mt-0.5",
            met
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-amber-700 dark:text-amber-400"
          )}
        >
          {status}
        </p>
      </div>
    </div>
    <div className="ml-[30px]">
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", met ? "bg-emerald-500" : "bg-amber-400")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  </div>
);

export default Forecast;
