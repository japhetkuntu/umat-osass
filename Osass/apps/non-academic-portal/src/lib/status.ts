import { buildTimelineSteps as buildSharedTimeline } from "@osass/domain/status";
export { normalizeStatus, isReadOnlyStatus, NON_ACADEMIC_REVIEW_STAGES } from "@osass/domain/status";

export const buildTimelineSteps = (reviewStatus?: string | null, applicationStatus?: string | null, submittedDate?: string) =>
  buildSharedTimeline(reviewStatus, applicationStatus, submittedDate, "non-academic");
