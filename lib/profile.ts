import { getStreakData } from "@/lib/streak";

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: ProfileStats) => boolean;
};

export type ProfileStats = {
  simulationsCompleted: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  level: number;
  scenariosByCategory: Record<string, number>;
  topSkills: string[];
};

export type ProfileData = {
  username: string;
  displayName: string;
  bio: string;
  avatarInitials: string;
  careerTrack: string;
  createdAt: string;
  lastActive: string;
};

export type RankTier = {
  name: string;
  minLevel: number;
  icon: string;
  color: string;
};

export const RANK_TIERS: RankTier[] = [
  { name: "Intern", minLevel: 1, icon: "🌱", color: "text-zinc-400" },
  { name: "Junior", minLevel: 2, icon: "🔰", color: "text-emerald-400" },
  { name: "Mid-Level", minLevel: 5, icon: "⚡", color: "text-sky-400" },
  { name: "Senior", minLevel: 8, icon: "🎯", color: "text-violet-400" },
  { name: "Staff", minLevel: 12, icon: "🏆", color: "text-amber-400" },
  { name: "Principal", minLevel: 16, icon: "👑", color: "text-rose-400" },
  { name: "Fellow", minLevel: 20, icon: "💎", color: "text-fuchsia-400" },
];

export function getRank(level: number): RankTier {
  let rank = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (level >= tier.minLevel) rank = tier;
  }
  return rank;
}

// ─── Badges ─────────────────────────────────────────────────────────

export const BADGES: Badge[] = [
  { id: "first-simulation", name: "First Steps", description: "Complete your first simulation", icon: "🎯", condition: (s) => s.simulationsCompleted >= 1 },
  { id: "five-simulations", name: "Getting Started", description: "Complete 5 simulations", icon: "⭐", condition: (s) => s.simulationsCompleted >= 5 },
  { id: "ten-simulations", name: "Dedicated", description: "Complete 10 simulations", icon: "🔥", condition: (s) => s.simulationsCompleted >= 10 },
  { id: "twenty-five-simulations", name: "Committed", description: "Complete 25 simulations", icon: "💪", condition: (s) => s.simulationsCompleted >= 25 },
  { id: "fifty-simulations", name: "Veteran", description: "Complete 50 simulations", icon: "🏅", condition: (s) => s.simulationsCompleted >= 50 },
  { id: "level-5", name: "Rising Star", description: "Reach level 5", icon: "🌟", condition: (s) => s.level >= 5 },
  { id: "level-10", name: "Power Player", description: "Reach level 10", icon: "⚡", condition: (s) => s.level >= 10 },
  { id: "level-15", name: "Elite", description: "Reach level 15", icon: "💎", condition: (s) => s.level >= 15 },
  { id: "level-20", name: "Legend", description: "Reach level 20", icon: "👑", condition: (s) => s.level >= 20 },
  { id: "perfect-score", name: "Perfect Score", description: "Score 10/10 on a simulation", icon: "💯", condition: (s) => s.averageScore >= 10 },
  { id: "high-scorer", name: "High Scorer", description: "Average score above 8", icon: "🏆", condition: (s) => s.averageScore >= 8 },
  { id: "streak-3", name: "On Fire", description: "3-day streak", icon: "🔥", condition: (s) => s.currentStreak >= 3 },
  { id: "streak-7", name: "Unstoppable", description: "7-day streak", icon: "⚡", condition: (s) => s.currentStreak >= 7 },
  { id: "streak-30", name: "Legendary Streak", description: "30-day streak", icon: "🌋", condition: (s) => s.currentStreak >= 30 },
  { id: "software-engineer", name: "Code Master", description: "Complete a software engineer simulation", icon: "💻", condition: (s) => (s.scenariosByCategory?.["software-engineer"] || 0) >= 1 },
  { id: "doctor", name: "Healer", description: "Complete a doctor simulation", icon: "🩺", condition: (s) => (s.scenariosByCategory?.["doctor"] || 0) >= 1 },
  { id: "lawyer", name: "Advocate", description: "Complete a lawyer simulation", icon: "⚖️", condition: (s) => (s.scenariosByCategory?.["lawyer"] || 0) >= 1 },
  { id: "xp-500", name: "Hard Worker", description: "Earn 500 XP", icon: "📈", condition: (s) => s.totalXp >= 500 },
  { id: "xp-1000", name: "XP Hunter", description: "Earn 1,000 XP", icon: "🚀", condition: (s) => s.totalXp >= 1000 },
  { id: "xp-5000", name: "XP Legend", description: "Earn 5,000 XP", icon: "💫", condition: (s) => s.totalXp >= 5000 },
];

// ─── Storage ─────────────────────────────────────────────────────────

const PROFILE_STORAGE_KEY = "careerSimProfile";

export function getDefaultProfile(): ProfileData {
  return {
    username: "player",
    displayName: "Player",
    bio: "Career simulation enthusiast. Leveling up one scenario at a time.",
    avatarInitials: "PL",
    careerTrack: "Not started",
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };
}

export function getProfile(): ProfileData {
  if (typeof window === "undefined") return getDefaultProfile();
  const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) {
    const defaultProfile = getDefaultProfile();
    saveProfile(defaultProfile);
    return defaultProfile;
  }
  try {
    return JSON.parse(raw) as ProfileData;
  } catch {
    return getDefaultProfile();
  }
}

export function saveProfile(profile: ProfileData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function updateProfile(updates: Partial<ProfileData>) {
  const current = getProfile();
  saveProfile({ ...current, ...updates, lastActive: new Date().toISOString() });
}

// ─── Statistics computation ─────────────────────────────────────────

const HISTORY_STORAGE_KEY = "careerSimHistory";

type HistoryRecord = {
  career?: string;
  scores: { technicalSkill: number; communication: number; decisionMaking: number };
  submittedAt: string;
  scenarioTitle?: string;
};

export function computeStats(totalXp: number, level: number): ProfileStats {
  if (typeof window === "undefined") {
    return {
      simulationsCompleted: 0,
      averageScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalXp,
      level,
      scenariosByCategory: {},
      topSkills: [],
    };
  }

  const streakData = getStreakData();
  const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
  let history: HistoryRecord[] = [];
  try {
    if (raw) history = JSON.parse(raw) as HistoryRecord[];
  } catch {}

  const scenariosByCategory: Record<string, number> = {};
  let totalScore = 0;
  let scoreCount = 0;

  for (const record of history) {
    const career = record.career || "unknown";
    scenariosByCategory[career] = (scenariosByCategory[career] || 0) + 1;

    if (record.scores) {
      const avg = (record.scores.technicalSkill + record.scores.communication + record.scores.decisionMaking) / 3;
      totalScore += avg;
      scoreCount++;
    }
  }

  const averageScore = scoreCount > 0 ? Math.round((totalScore / scoreCount) * 10) / 10 : 0;

  // Top skills: categories with most completions
  const topSkills = Object.entries(scenariosByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([key]) => {
      const labels: Record<string, string> = {
        "software-engineer": "Software Engineering",
        "doctor": "Medical",
        "lawyer": "Legal",
        "investment-banker": "Finance",
        "product-manager": "Product",
        "data-scientist": "Data Science",
      };
      return labels[key] || key;
    });

  return {
    simulationsCompleted: history.length,
    averageScore,
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
    totalXp,
    level,
    scenariosByCategory,
    topSkills,
  };
}

export function getEarnedBadges(stats: ProfileStats): Badge[] {
  return BADGES.filter((badge) => badge.condition(stats));
}