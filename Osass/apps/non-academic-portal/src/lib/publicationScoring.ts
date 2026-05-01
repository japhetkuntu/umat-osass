/**
 * Publication Scoring Utilities
 * Handles calculation of publication scores including presentation bonuses
 */

const PRESENTATION_BONUS = 2;

export interface PublicationScore {
  baseScore: number;
  presentationBonus: number;
  totalScore: number;
}

/**
 * Calculate total publication score including presentation bonus
 * @param systemGeneratedScore - Base system score
 * @param isPresented - Whether the publication was presented
 * @returns Score breakdown with base, bonus, and total
 */
export const calculatePublicationScore = (
  systemGeneratedScore: number,
  isPresented?: boolean
): PublicationScore => {
  const baseScore = systemGeneratedScore || 0;
  const presentationBonus = isPresented ? PRESENTATION_BONUS : 0;
  
  return {
    baseScore,
    presentationBonus,
    totalScore: baseScore + presentationBonus,
  };
};

/**
 * Get the effective score to display (total with bonus if presented)
 * @param systemGeneratedScore - Base system score
 * @param isPresented - Whether the publication was presented
 * @returns Total effective score
 */
export const getEffectivePublicationScore = (
  systemGeneratedScore: number,
  isPresented?: boolean
): number => {
  return calculatePublicationScore(systemGeneratedScore, isPresented).totalScore;
};

/**
 * Format publication score for display with breakdown
 * @param systemGeneratedScore - Base system score
 * @param isPresented - Whether the publication was presented
 * @returns Formatted string showing base + bonus = total
 */
export const formatPublicationScoreWithBreakdown = (
  systemGeneratedScore: number,
  isPresented?: boolean
): string => {
  const score = calculatePublicationScore(systemGeneratedScore, isPresented);
  
  if (score.presentationBonus > 0) {
    return `${score.baseScore} + ${score.presentationBonus} (presentation) = ${score.totalScore}`;
  }
  
  return score.baseScore.toString();
};

/**
 * Calculate total publications score for a set of publications
 * @param publications - Array of publication records with system scores and presentation flags
 * @returns Total score including all bonuses
 */
export const calculateTotalPublicationsScore = (
  publications: Array<{ systemGeneratedScore?: number; isPresented?: boolean }>
): number => {
  return publications.reduce((sum, pub) => {
    const score = calculatePublicationScore(pub.systemGeneratedScore || 0, pub.isPresented);
    return sum + score.totalScore;
  }, 0);
};
