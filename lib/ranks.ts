import { getStoredXp, getLevelForXp } from "@/lib/leveling";
import { getStoredEarnedIds } from "@/lib/achievements";
import { getInterviewHistory } from "@/lib/interview-history";

export type ReputationRank = {
  name: string;
  tier: number;
  icon: string;
  color: string;
  gradient: string;
  bgGlow: string;
  minScore: number;
};

export const REPUTATION_RANKS: ReputationRank[] = [
  {
    name: "Bronze",
    tier: 1,
    icon: "🥉",
    color: "text-amber-600",
    gradient: "from-amber-600 to-amber-400",
    bgGlow: "shadow-amber-500/20",
    minScore: 0,
  },
  {
    name: "Silver",
    tier: 2,
    icon: "🥈",
    color: "text-slate-300",
    gradient: "from-slate-400 to-slate-200",
    bgGlow: "shadow-slate-300/20",
    minScore: 20,
  },
  {
    name: "Gold",
    tier: 3,
    icon: "🥇",
    color: "text-yellow-400",
    gradient: "from-yellow-500 to-yellow-300",
    bgGlow: "shadow-yellow-400/20",
    minScore: 50,
  },
  {
    name: "Platinum",
    tier: 4,
    icon: "💠",
    color: "text-cyan-300",
    gradient: "from-cyan-400 to-cyan-200",
    bgGlow: "shadow-cyan-300/20",
    minScore: 90,
  },
  {
    name: "Diamond",
    tier: 5,
    icon: "💎",
    color: "text-blue-300",
    gradient: "from-blue-400 to-sky-200",
    bgGlow: "shadow-blue-300/20",
    minScore: 140,
  },
  {
    name: "Master",
    tier: 6,
    icon: "🏆",
    color: "text-violet-300",
    gradient: "from-violet-500 to-fuchsia-300",
    bgGlow: "shadow-violet-400/20",
    minScore: 200,
  },
  {
    name: "Legend",
    tier: 7,
    icon: "👑",
    color: "text-amber-200",
    gradient: "from-amber-400 via-orange-400 to-rose-400",
    bgGlow: "shadow-amber-300/20",
    minScore: 280,
  },
];

function computeReputationScore(): number {
  if (typeof window === "undefined") return 0;

  const xp = getStoredXp();
  const level = getLevelForXp(xp).level;
  const history = getInterviewHistory();
  const earnedAchievementIds = getStoredEarnedIds();

  // XP contribution (0-100 points for up to 5000 XP)
  const xpScore = Math.min(100, Math.floor(xp / 50));

  // Level contribution (0-60 points)
  const levelScore = Math.min(60, level * 3);

  // Achievement contribution (0-50 points)
  const achievementScore = Math.min(50, earnedAchievementIds.length * 3);

  // Performance contribution (0-70 points based on average score)
  let performanceScore = 0;
  if (history.length > 0) {
    const avg = history.reduce((sum, r) => sum + r.averageScore, 0) / history.length;
    performanceScore = Math.min(70, Math.round(avg * 7));
  }

  return xpScore + levelScore + achievementScore + performanceScore;
}

export function getReputationRank(): ReputationRank {
  const score = computeReputationScore();
  let rank = REPUTATION_RANKS[0];
  for (const r of REPUTATION_RANKS) {
    if (score >= r.minScore) rank = r;
  }
  return rank;
}

export function getReputationScore(): number {
  return computeReputationScore();
}

export function getReputationProgress(): {
  current: number;
  next: number;
  score: number;
  maxForNext: number;
} {
  const score = computeReputationScore();
  const currentRank = getReputationRank();
  const nextRank = REPUTATION_RANKS.find((r) => r.tier === currentRank.tier + 1);

  if (!nextRank) {
    // Max rank — show full progress
    return {
      current: currentRank.tier,
      next: currentRank.tier,
      score,
      maxForNext: currentRank.minScore + 50,
    };
  }

  const range = nextRank.minScore - currentRank.minScore;
  const progress = score - currentRank.minScore;

  return {
    current: currentRank.tier,
    next: nextRank.tier,
    score,
    maxForNext: range,
  };
}

export const RANK_HISTORY_KEY = "careerSimReputationRank";