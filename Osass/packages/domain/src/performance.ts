export type PerformanceLevel = "High" | "Good" | "Adequate" | "Inadequate";

export type PerformanceCategory = "academic-teaching" | "academic-publications" | "academic-service" | "non-academic-work" | "non-academic-knowledge" | "non-academic-service";

const thresholds: Record<PerformanceCategory, readonly [number, number, number]> = {
  "academic-teaching": [80, 60, 50],
  "academic-publications": [90, 70, 50],
  "academic-service": [100, 50, 30],
  "non-academic-work": [70, 40, 20],
  "non-academic-knowledge": [90, 70, 50],
  "non-academic-service": [70, 40, 20],
};

export const classifyPerformance = (score: number, category: PerformanceCategory): PerformanceLevel => {
  const [high, good, adequate] = thresholds[category];
  return score >= high ? "High" : score >= good ? "Good" : score >= adequate ? "Adequate" : "Inadequate";
};

export const performancePreview = (score: number, category: PerformanceCategory) => {
  const label = classifyPerformance(score, category);
  const styles = {
    High: { className: "text-success", bg: "bg-success/10" },
    Good: { className: "text-primary", bg: "bg-primary/10" },
    Adequate: { className: "text-warning", bg: "bg-warning/10" },
    Inadequate: { className: "text-muted-foreground", bg: "bg-muted/10" },
  };
  return { label, ...styles[label] };
};

export const normalizePerformance = (value?: string | null): PerformanceLevel | null => {
  if (!value) return null;
  const compact = value.toLowerCase().replace(/[\s_-]+/g, "");
  if (compact === "inadequate") return "Inadequate";
  if (compact === "adequate") return "Adequate";
  if (compact === "high" || compact === "excellent") return "High";
  if (compact === "good") return "Good";
  return null;
};

export const normalizePerformanceLevel = normalizePerformance;
export const isInadequateLevel = (value?: string | null): boolean => normalizePerformance(value) === "Inadequate";

export const performanceRank = (value?: string | null): number => {
  switch (normalizePerformance(value)) {
    case "High": return 3;
    case "Good": return 2;
    case "Adequate": return 1;
    default: return 0;
  }
};

export const PERFORMANCE_STYLES: Record<PerformanceLevel, { label: string; className: string }> = {
  High: { label: "High", className: "bg-success-light text-success" },
  Good: { label: "Good", className: "bg-info-light text-info" },
  Adequate: { label: "Adequate", className: "bg-warning-light text-warning" },
  Inadequate: { label: "Inadequate", className: "bg-muted text-muted-foreground" },
};

export const performanceLabel = (value?: string | null): string => normalizePerformance(value) ?? "—";
export const performanceClassName = (value?: string | null): string => {
  const level = normalizePerformance(value);
  return level ? PERFORMANCE_STYLES[level].className : "bg-muted text-muted-foreground";
};
