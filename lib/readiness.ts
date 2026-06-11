import { getAllCompanies, type Company } from "@/lib/companies";

export type CompanyReadiness = {
  companyId: string;
  companyName: string;
  score: number;
  level: number;
  unlocked: boolean;
  tier: number;
};

export type ReadinessCategory = {
  tierName: string;
  tierMinLevel: number;
  companies: CompanyReadiness[];
};

// ─── History types ────────────────────────────────────────────────

type HistoryRecord = {
  career?: string;
  scores: { technicalSkill: number; communication: number; decisionMaking: number };
  submittedAt: string;
  difficulty?: string;
};

// ─── Scoring weights ──────────────────────────────────────────────

const DIFFICULTY_MULTIPLIERS: Record<string, number> = {
  easy: 1.0,
  medium: 1.2,
  hard: 1.5,
};

const MAX_XP_BONUS = 15; // percentage points
const XP_THRESHOLD = 5000; // XP needed for max bonus
const MAX_LEVEL_BONUS = 10; // percentage points
const LEVEL_THRESHOLD = 20; // level needed for max bonus

// ─── Core calculation ─────────────────────────────────────────────

/**
 * Calculate company readiness scores for a given career.
 * Reads from localStorage to compute scores based on:
 * - Average evaluation scores (technicalSkill, communication, decisionMaking)
 * - Difficulty of completed simulations
 * - Total XP
 * - Current level
 * - Tier multiplier (higher tier companies require better performance)
 */
export function getCompanyReadiness(careerKey: string, level: number, xp: number): CompanyReadiness[] {
  const companies = getAllCompanies(careerKey);
  if (companies.length === 0) return [];

  // Read history
  let history: HistoryRecord[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("careerSimHistory");
      if (raw) history = JSON.parse(raw) as HistoryRecord[];
    } catch {}
  }

  // Filter history to relevant career
  const careerHistory = history.filter(
    (r) => !r.career || r.career === careerKey
  );

  // Compute aggregate stats from history
  const totalSims = careerHistory.length;
  let totalScore = 0;
  let scoreCount = 0;
  let weightedScoreSum = 0;
  let weightSum = 0;

  for (const record of careerHistory) {
    if (record.scores) {
      const avg = (record.scores.technicalSkill + record.scores.communication + record.scores.decisionMaking) / 3;
      totalScore += avg;
      scoreCount++;

      const diffMult = DIFFICULTY_MULTIPLIERS[record.difficulty || "medium"] || 1.0;
      weightedScoreSum += avg * diffMult;
      weightSum += diffMult;
    }
  }

  const averageScore = scoreCount > 0 ? totalScore / scoreCount : 0;
  const weightedAverage = weightSum > 0 ? weightedScoreSum / weightSum : 0;

  // XP bonus (0 to MAX_XP_BONUS)
  const xpBonus = Math.min(MAX_XP_BONUS, (xp / XP_THRESHOLD) * MAX_XP_BONUS);

  // Level bonus (0 to MAX_LEVEL_BONUS)
  const levelBonus = Math.min(MAX_LEVEL_BONUS, (level / LEVEL_THRESHOLD) * MAX_LEVEL_BONUS);

  // Base readiness from weighted average (scaled to percentage)
  const baseReadiness = (weightedAverage / 10) * 100;

  // Simulation count bonus: 0-5 points based on how many sims completed
  const simBonus = Math.min(5, totalSims * 0.5);

  return companies.map((company) => {
    const unlocked = level >= company.unlockLevel;

    // Tier multiplier: higher tier companies demand higher readiness
    // Tier 1: 1.0x, Tier 2: 0.9x, Tier 3: 0.8x, Tier 4: 0.7x
    // This means to get a high score on Google (tier 4), you need better performance
    const tierFactor = Math.max(0.5, 1.0 - (company.tier - 1) * 0.1);

    // Calculate score
    let score = (baseReadiness + xpBonus + levelBonus + simBonus) * tierFactor;

    // If user hasn't done any simulations, give a minimum starting score based on level
    if (totalSims === 0) {
      score = Math.min(20, level * 3);
    }

    // Clamp to 0-100
    score = Math.max(0, Math.min(100, Math.round(score)));

    return {
      companyId: company.id,
      companyName: company.name,
      score,
      level: company.unlockLevel,
      unlocked,
      tier: company.tier,
    };
  });
}

/**
 * Get readiness grouped by tier for display.
 */
export function getReadinessByTier(careerKey: string, level: number, xp: number): ReadinessCategory[] {
  const data = getCompanyReadiness(careerKey, level, xp);
  const tierMap = new Map<number, ReadinessCategory>();

  const tierLabels: Record<number, { name: string; minLevel: number }> = {
    1: { name: "Entry Level", minLevel: 1 },
    2: { name: "Mid Level", minLevel: 4 },
    3: { name: "Senior Level", minLevel: 8 },
    4: { name: "Expert Level", minLevel: 13 },
  };

  for (const entry of data) {
    if (!tierMap.has(entry.tier)) {
      const label = tierLabels[entry.tier] || { name: `Tier ${entry.tier}`, minLevel: 1 };
      tierMap.set(entry.tier, {
        tierName: label.name,
        tierMinLevel: label.minLevel,
        companies: [],
      });
    }
    tierMap.get(entry.tier)!.companies.push(entry);
  }

  return Array.from(tierMap.values()).sort((a, b) => a.tierMinLevel - b.tierMinLevel);
}

/**
 * Get a color class based on readiness score.
 */
export function getReadinessColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-sky-400";
  if (score >= 40) return "text-amber-400";
  if (score >= 20) return "text-orange-400";
  return "text-red-400";
}

export function getReadinessBgColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-sky-500";
  if (score >= 40) return "bg-amber-500";
  if (score >= 20) return "bg-orange-500";
  return "bg-red-500";
}

/**
 * Get a label for the readiness level.
 */
export function getReadinessLabel(score: number): string {
  if (score >= 90) return "Expert Ready";
  if (score >= 80) return "Strong Ready";
  if (score >= 65) return "Well Prepared";
  if (score >= 50) return "Getting There";
  if (score >= 30) return "Needs Practice";
  if (score >= 15) return "Beginner";
  return "Not Started";
}