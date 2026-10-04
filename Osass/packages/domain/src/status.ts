export type ApplicationStatus = "not-started" | "in-progress" | "submitted" | "under-review" | "decision-pending" | "approved" | "not-approved" | "returned" | "draft";
export type PromotionTrack = "academic" | "non-academic";

export const normalizeReviewStage = (value?: string | null): string =>
  value?.trim().toLowerCase().replace(/[\s_]+/g, "-") || "";

export const normalizeStatus = (value?: string | null): ApplicationStatus =>
  (normalizeReviewStage(value) || "not-started") as ApplicationStatus;

export const isReadOnlyStatus = (value?: string | null): boolean =>
  ["submitted", "under-review", "decision-pending", "approved", "not-approved"].includes(normalizeStatus(value));

export const REVIEW_STAGES = [
  { id: "Submitted", label: "Submitted", description: "Your application has been received" },
  { id: "Department Review", label: "Department Review", description: "Reviewed by the Departmental Appointments and Promotions Committee" },
  { id: "Faculty Review", label: "Faculty Review", description: "Reviewed by the Faculty Appointments and Promotions Committee" },
  { id: "UAPC Review", label: "UAPC Review", description: "Reviewed by the University Appointments and Promotions Committee" },
  { id: "Council Decision", label: "Council Decision", description: "Final decision by the University Council" },
] as const;

export const NON_ACADEMIC_REVIEW_STAGES = [
  { id: "Submitted", label: "Application Submitted" },
  { id: "HOU Review", label: "Head of Unit Review" },
  { id: "AAPSC Review", label: "Administrative and Allied Professions Sub-Committee" },
  { id: "UAPC Decision", label: "University Non-Teaching Staff Promotion Committee" },
  { id: "Council Approved", label: "Council Decision" },
] as const;

export const reviewStageIndex = (value?: string | null, track: PromotionTrack = "academic"): number => {
  const stage = normalizeReviewStage(value);
  if (stage === "submitted" || stage === "application-submitted") return 0;
  if (track === "non-academic") return NON_ACADEMIC_REVIEW_STAGES.findIndex(item => normalizeStatus(item.id) === stage);
  if (stage.startsWith("council")) return 4;
  if (stage.startsWith("uapc") || stage.startsWith("external")) return 3;
  if (stage.startsWith("faculty")) return 2;
  if (stage.startsWith("department")) return 1;
  return -1;
};

export interface TimelineStepData {
  id: string;
  label: string;
  status: "completed" | "current" | "upcoming";
  date?: string;
}

export const buildTimelineSteps = (reviewStatus?: string | null, applicationStatus?: string | null, submittedDate?: string, track: PromotionTrack = "academic"): TimelineStepData[] => {
  const stages = track === "academic" ? REVIEW_STAGES : NON_ACADEMIC_REVIEW_STAGES;
  const decided = ["approved", "not-approved"].includes(normalizeStatus(applicationStatus));
  const current = reviewStageIndex(reviewStatus, track);
  return stages.map((stage, index): TimelineStepData => ({
    id: stage.id,
    label: stage.label,
    status: decided || index < current ? "completed" : index === current ? "current" : "upcoming",
    date: index === 0 ? submittedDate : undefined,
  }));
};
