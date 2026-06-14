import { getInterviewHistory } from "@/lib/interview-history";
import { getStoredXp, getLevelForXp } from "@/lib/leveling";

export function isBossUnlocked(level: number): boolean {
  return level >= 5;
}

export function getDifficultyByLevel(level: number) {
  if (level < 2) return "easy";
  if (level < 5) return "medium";
  return "hard";
}

export function isScenarioUnlocked(requiredLevel: number, userLevel: number) {
  return userLevel >= requiredLevel;
}

// ─── Performance-Based Company Unlock System ─────────────────────────
// Companies must NOT unlock automatically based on level alone.
// Unlock requires: minimum average score, minimum simulations completed,
// required level, and minimum reputation rank.

export type UnlockRequirement = {
  minLevel: number;
  minAverageScore: number; // 0-10 scale
  minSimulations: number;
  minReputationTier: number; // 1-7 (Bronze=1, Legend=7)
};

// Compound key format: "careerKey:companyId" to avoid duplicates across careers
export const COMPANY_UNLOCK_REQUIREMENTS: Record<string, UnlockRequirement> = {
  // Software Engineer companies
  "softwareEngineer:tcs": { minLevel: 1, minAverageScore: 1, minSimulations: 1, minReputationTier: 1 },
  "softwareEngineer:infosys": { minLevel: 1, minAverageScore: 2, minSimulations: 1, minReputationTier: 1 },
  "softwareEngineer:accenture": { minLevel: 4, minAverageScore: 4, minSimulations: 3, minReputationTier: 1 },
  "softwareEngineer:capgemini": { minLevel: 4, minAverageScore: 4, minSimulations: 3, minReputationTier: 1 },
  "softwareEngineer:microsoft": { minLevel: 8, minAverageScore: 6, minSimulations: 8, minReputationTier: 2 },
  "softwareEngineer:adobe": { minLevel: 8, minAverageScore: 6, minSimulations: 8, minReputationTier: 2 },
  "softwareEngineer:google": { minLevel: 13, minAverageScore: 7.5, minSimulations: 15, minReputationTier: 3 },
  "softwareEngineer:meta": { minLevel: 13, minAverageScore: 7.5, minSimulations: 15, minReputationTier: 3 },
  "softwareEngineer:amazon": { minLevel: 13, minAverageScore: 7.5, minSimulations: 15, minReputationTier: 3 },

  // Doctor companies
  "doctor:apollo": { minLevel: 1, minAverageScore: 1, minSimulations: 1, minReputationTier: 1 },
  "doctor:cloudnine": { minLevel: 1, minAverageScore: 2, minSimulations: 1, minReputationTier: 1 },
  "doctor:fortis": { minLevel: 4, minAverageScore: 4, minSimulations: 3, minReputationTier: 1 },
  "doctor:medanta": { minLevel: 7, minAverageScore: 6, minSimulations: 8, minReputationTier: 2 },
  "doctor:aiims": { minLevel: 10, minAverageScore: 8, minSimulations: 15, minReputationTier: 3 },

  // Lawyer companies
  "lawyer:induslaw": { minLevel: 1, minAverageScore: 1, minSimulations: 1, minReputationTier: 1 },
  "lawyer:khaitan": { minLevel: 4, minAverageScore: 4, minSimulations: 3, minReputationTier: 1 },
  "lawyer:azb": { minLevel: 7, minAverageScore: 6, minSimulations: 8, minReputationTier: 2 },
  "lawyer:cyril": { minLevel: 10, minAverageScore: 8, minSimulations: 15, minReputationTier: 3 },

  // Investment Banker companies
  "investmentBanker:moelis": { minLevel: 1, minAverageScore: 1, minSimulations: 1, minReputationTier: 1 },
  "investmentBanker:barclays": { minLevel: 4, minAverageScore: 4, minSimulations: 3, minReputationTier: 1 },
  "investmentBanker:goldman": { minLevel: 7, minAverageScore: 6, minSimulations: 8, minReputationTier: 2 },
  "investmentBanker:jpmorgan": { minLevel: 10, minAverageScore: 8, minSimulations: 15, minReputationTier: 3 },

  // Product Manager companies
  "productManager:swiggy": { minLevel: 1, minAverageScore: 1, minSimulations: 1, minReputationTier: 1 },
  "productManager:flipkart": { minLevel: 4, minAverageScore: 4, minSimulations: 3, minReputationTier: 1 },
  "productManager:google": { minLevel: 7, minAverageScore: 6, minSimulations: 8, minReputationTier: 2 },
  "productManager:amazon": { minLevel: 10, minAverageScore: 8, minSimulations: 15, minReputationTier: 3 },

  // Data Scientist companies
  "dataScientist:fractal": { minLevel: 1, minAverageScore: 1, minSimulations: 1, minReputationTier: 1 },
  "dataScientist:ibm": { minLevel: 4, minAverageScore: 4, minSimulations: 3, minReputationTier: 1 },
  "dataScientist:deloitte": { minLevel: 7, minAverageScore: 6, minSimulations: 8, minReputationTier: 2 },
  "dataScientist:bcg-gamma": { minLevel: 10, minAverageScore: 8, minSimulations: 15, minReputationTier: 3 },
};

/**
 * Check if a company should be unlocked based on performance metrics.
 * Poor performance must NEVER unlock companies.
 */
export function isCompanyUnlockedByPerformance(
  careerKey: string,
  companyId: string,
  level: number,
  averageScore: number,
  simulationsCompleted: number,
  reputationTier: number
): boolean {
  const req = COMPANY_UNLOCK_REQUIREMENTS[`${careerKey}:${companyId}`];
  if (!req) {
    // If no specific requirement defined, use level-only as fallback
    // but still require minimum performance
    if (level < 1) return false;
    if (averageScore < 1 && simulationsCompleted > 0) return false;
    return true;
  }

  // ALL requirements must be met
  if (level < req.minLevel) return false;
  if (averageScore < req.minAverageScore) return false;
  if (simulationsCompleted < req.minSimulations) return false;
  if (reputationTier < req.minReputationTier) return false;

  return true;
}

/**
 * Get all companies that are unlocked for a user based on their performance.
 * This is the single source of truth for company unlock status.
 */
export function getUnlockedCompaniesByPerformance(
  careerKey: string,
  companies: { id: string; name: string; unlockLevel: number }[],
  level: number,
  averageScore: number,
  simulationsCompleted: number,
  reputationTier: number
): string[] {
  return companies
    .filter((c) =>
      isCompanyUnlockedByPerformance(
        careerKey,
        c.id,
        level,
        averageScore,
        simulationsCompleted,
        reputationTier
      )
    )
    .map((c) => c.id);
}

/**
 * Get reputation tier from level (simplified mapping).
 */
export function getReputationTier(level: number): number {
  if (level >= 20) return 7; // Legend
  if (level >= 16) return 6; // Master
  if (level >= 12) return 5; // Diamond
  if (level >= 9) return 4;  // Platinum
  if (level >= 6) return 3;  // Gold
  if (level >= 3) return 2;  // Silver
  return 1; // Bronze
}