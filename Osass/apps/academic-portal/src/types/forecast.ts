// Type definitions for the eligibility forecast feature

export interface PromotionMilestone {
  milestoneOrder: number;
  targetPosition: string;
  previousPosition: string;

  // Timeline & Eligibility
  minimumYearsRequired: number;
  currentYearsInRank: number;
  remainingYearsRequired: number;
  estimatedEligibilityDate?: string | null;
  isEligible: boolean;
  isLocked: boolean; // Future milestones locked until promoted to intermediate position
  hasUploadedData: boolean; // True only when the applicant has uploaded records for this specific target position
  performanceCriteriaOptions: string[];
  performanceGap?: PerformanceGap;

  // Publication Requirements
  minimumPublications: number;
  currentPublications: number;
  publicationsGap: number;

  minimumRefereedJournals: number;
  currentRefereedJournals: number;
  refereedJournalsGap: number;

  // Action Items
  requiredActions: ActionItem[];
}

export interface PerformanceGap {
  currentScores: string;
  targetScores: string;
  areasForImprovement: string[];
}

export interface ActionItem {
  category: string; // "Teaching", "Publications", "Service", "Timeline"
  action: string;
  details?: string;
  targetCount?: number;
  targetDate?: string;
  priority: number; // 1=Critical, 2=Important, 3=Optional
}

export interface EligibilityForecastResponse {
  applicantName: string;
  currentPosition: string;
  lastPromotionDate: string;
  milestones: PromotionMilestone[];
  nextEligibleMilestone?: PromotionMilestone;
}
