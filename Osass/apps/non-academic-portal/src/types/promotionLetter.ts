export interface PromotionLetterData {
    applicationId: string;
    staffName: string;
    staffId: string;
    currentPosition: string;
    nextPosition: string;
    department: string;
    faculty: string;
    letterDate: string;
    letterNumber: string;
    
    // Performance scores
    performanceAtWorkScore: number;
    knowledgeProfessionScore: number;
    serviceScore: number;
    overallScore: number;
    performanceAtWorkPerformance: string;
    knowledgeProfessionPerformance: string;
    servicePerformance: string;
    overallPerformance: string;
    
    // Application details
    applicationSubmissionDate: string;
    approvalDate: string;
    applicationStatus: string;
    reviewStatus: string;
    
    // Eligibility
    yearsInCurrentPosition: number;
    yearsRequired: number;
    
    // Summary
    summary: string;
    recommendation: string;
    
    // Signatories
    approvedBy: string;
    approverTitle: string;
}

export interface PromotionLetterResponse {
    success: boolean;
    data: PromotionLetterData;
    message: string;
}
