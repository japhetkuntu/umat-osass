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

  // Knowledge & Profession Requirements
  minimumKnowledgeMaterials: number;
  currentKnowledgeMaterials: number;
  knowledgeMaterialsGap: number;

  minimumJournals: number;
  currentJournals: number;
  journalsGap: number;

  // Action Items
  requiredActions: string[];
}

export interface EligibilityForecastResponse {
  applicantName: string;
  currentPosition: string;
  lastPromotionDate: string;
  milestones: PromotionMilestone[];
  nextEligibleMilestone?: PromotionMilestone;
}
