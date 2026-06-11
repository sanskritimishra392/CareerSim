export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "simulations" | "level" | "streak" | "score" | "career" | "xp" | "hard-questions";
  condition: (stats: AchievementStats) => boolean;
};

export type AchievementStats = {
  simulationsCompleted: number;
  averageScore: number;
  maxScore: number;
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  level: number;
  hardQuestionsCompleted: number;
  scenariosByCategory: Record<string, number>;
  topSkills: string[];
};

export const ACHIEVEMENTS: Achievement[] = [
  // ─── Simulations ─────────────────────────────────────────────────
  { id: "first-simulation", name: "First Steps", description: "Complete your first simulation", icon: "🎯", category: "simulations", condition: (s) => s.simulationsCompleted >= 1 },
  { id: "five-simulations", name: "Getting Started", description: "Complete 5 simulations", icon: "⭐", category: "simulations", condition: (s) => s.simulationsCompleted >= 5 },
  { id: "ten-simulations", name: "Dedicated", description: "Complete 10 simulations", icon: "🔥", category: "simulations", condition: (s) => s.simulationsCompleted >= 10 },
  { id: "twenty-five-simulations", name: "Committed", description: "Complete 25 simulations", icon: "💪", category: "simulations", condition: (s) => s.simulationsCompleted >= 25 },
  { id: "fifty-simulations", name: "Veteran", description: "Complete 50 simulations", icon: "🏅", category: "simulations", condition: (s) => s.simulationsCompleted >= 50 },
  { id: "hundred-simulations", name: "Century", description: "Complete 100 simulations", icon: "💎", category: "simulations", condition: (s) => s.simulationsCompleted >= 100 },
  { id: "five-hundred-simulations", name: "Marathon Runner", description: "Complete 500 simulations", icon: "👑", category: "simulations", condition: (s) => s.simulationsCompleted >= 500 },

  // ─── Level ───────────────────────────────────────────────────────
  { id: "level-5", name: "Rising Star", description: "Reach level 5", icon: "🌟", category: "level", condition: (s) => s.level >= 5 },
  { id: "level-10", name: "Power Player", description: "Reach level 10", icon: "⚡", category: "level", condition: (s) => s.level >= 10 },
  { id: "level-15", name: "Elite", description: "Reach level 15", icon: "💎", category: "level", condition: (s) => s.level >= 15 },
  { id: "level-20", name: "Legend", description: "Reach level 20", icon: "👑", category: "level", condition: (s) => s.level >= 20 },

  // ─── Score ───────────────────────────────────────────────────────
  { id: "perfect-score", name: "Perfect Score", description: "Score 10/10 on a simulation", icon: "💯", category: "score", condition: (s) => s.maxScore >= 10 },
  { id: "high-scorer", name: "High Scorer", description: "Average score above 8", icon: "🏆", category: "score", condition: (s) => s.averageScore >= 8 },

  // ─── Hard Questions ──────────────────────────────────────────────
  { id: "first-hard", name: "Taking Challenges", description: "Complete 1 hard question", icon: "🎯", category: "hard-questions", condition: (s) => s.hardQuestionsCompleted >= 1 },
  { id: "ten-hard", name: "Difficulty Seeker", description: "Complete 10 hard questions", icon: "⚔️", category: "hard-questions", condition: (s) => s.hardQuestionsCompleted >= 10 },
  { id: "fifty-hard", name: "Hardened Veteran", description: "Complete 50 hard questions", icon: "🛡️", category: "hard-questions", condition: (s) => s.hardQuestionsCompleted >= 50 },
  { id: "hundred-hard", name: "Impossible Mode", description: "Complete 100 hard questions", icon: "☠️", category: "hard-questions", condition: (s) => s.hardQuestionsCompleted >= 100 },

  // ─── Streak ──────────────────────────────────────────────────────
  { id: "streak-3", name: "On Fire", description: "3-day streak", icon: "🔥", category: "streak", condition: (s) => s.currentStreak >= 3 },
  { id: "streak-7", name: "Unstoppable", description: "7-day streak", icon: "⚡", category: "streak", condition: (s) => s.currentStreak >= 7 },
  { id: "streak-30", name: "Legendary Streak", description: "30-day streak", icon: "🌋", category: "streak", condition: (s) => s.currentStreak >= 30 },
  { id: "streak-100", name: "Century Streak", description: "100-day streak", icon: "💫", category: "streak", condition: (s) => s.currentStreak >= 100 },
  { id: "streak-365", name: "Year of Excellence", description: "365-day streak", icon: "⭐", category: "streak", condition: (s) => s.currentStreak >= 365 },

  // ─── Career ──────────────────────────────────────────────────────
  { id: "software-engineer", name: "Code Master", description: "Complete a software engineer simulation", icon: "💻", category: "career", condition: (s) => (s.scenariosByCategory?.["software-engineer"] || 0) >= 1 },
  { id: "doctor", name: "Healer", description: "Complete a doctor simulation", icon: "🩺", category: "career", condition: (s) => (s.scenariosByCategory?.["doctor"] || 0) >= 1 },
  { id: "lawyer", name: "Advocate", description: "Complete a lawyer simulation", icon: "⚖️", category: "career", condition: (s) => (s.scenariosByCategory?.["lawyer"] || 0) >= 1 },
  { id: "investment-banker", name: "Wall Street", description: "Complete an investment banker simulation", icon: "💼", category: "career", condition: (s) => (s.scenariosByCategory?.["investment-banker"] || 0) >= 1 },
  { id: "product-manager", name: "Product Visionary", description: "Complete a product manager simulation", icon: "📈", category: "career", condition: (s) => (s.scenariosByCategory?.["product-manager"] || 0) >= 1 },
  { id: "data-scientist", name: "Data Wizard", description: "Complete a data scientist simulation", icon: "📊", category: "career", condition: (s) => (s.scenariosByCategory?.["data-scientist"] || 0) >= 1 },
  { id: "all-careers", name: "Renaissance", description: "Complete a simulation in every career", icon: "🌐", category: "career", condition: (s) =>
    (s.scenariosByCategory?.["software-engineer"] || 0) >= 1 &&
    (s.scenariosByCategory?.["doctor"] || 0) >= 1 &&
    (s.scenariosByCategory?.["lawyer"] || 0) >= 1 &&
    (s.scenariosByCategory?.["investment-banker"] || 0) >= 1 &&
    (s.scenariosByCategory?.["product-manager"] || 0) >= 1 &&
    (s.scenariosByCategory?.["data-scientist"] || 0) >= 1 },

  // ─── XP ──────────────────────────────────────────────────────────
  { id: "xp-500", name: "Hard Worker", description: "Earn 500 XP", icon: "📈", category: "xp", condition: (s) => s.totalXp >= 500 },
  { id: "xp-1000", name: "XP Hunter", description: "Earn 1,000 XP", icon: "🚀", category: "xp", condition: (s) => s.totalXp >= 1000 },
  { id: "xp-5000", name: "XP Legend", description: "Earn 5,000 XP", icon: "💫", category: "xp", condition: (s) => s.totalXp >= 5000 },
  { id: "xp-10000", name: "XP Titan", description: "Earn 10,000 XP", icon: "🌌", category: "xp", condition: (s) => s.totalXp >= 10000 },
];

export const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  simulations: { label: "Simulations", icon: "🎮" },
  level: { label: "Level", icon: "📊" },
  score: { label: "Score", icon: "💯" },
  "hard-questions": { label: "Hard Questions", icon: "☠️" },
  streak: { label: "Streak", icon: "🔥" },
  career: { label: "Career", icon: "💼" },
  xp: { label: "XP", icon: "⚡" },
};

// ─── Notification Storage ──────────────────────────────────────────

const NOTIFICATION_KEY = "careerSimNewAchievements";

export type AchievementNotification = {
  id: string;
  name: string;
  icon: string;
  timestamp: number;
};

export function getStoredEarnedIds(): string[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("careerSimEarnedAchievements");
  if (!raw) return [];
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

function saveEarnedIds(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("careerSimEarnedAchievements", JSON.stringify(ids));
}

export function getNewAchievements(stats: AchievementStats): AchievementNotification[] {
  const earned = getEarnedIds(stats);
  const storedIds = getStoredEarnedIds();
  const newAchievements: AchievementNotification[] = [];

  for (const ach of earned) {
    if (!storedIds.includes(ach.id)) {
      newAchievements.push({
        id: ach.id,
        name: ach.name,
        icon: ach.icon,
        timestamp: Date.now(),
      });
    }
  }

  return newAchievements;
}

export function getEarnedIds(stats: AchievementStats): Achievement[] {
  return ACHIEVEMENTS.filter((ach) => ach.condition(stats));
}

export function getEarnedAchievementIds(stats: AchievementStats): string[] {
  return getEarnedIds(stats).map((a) => a.id);
}

export function saveEarnedAndGetNew(stats: AchievementStats): AchievementNotification[] {
  const earnedIds = getEarnedAchievementIds(stats);
  const storedIds = getStoredEarnedIds();
  const newOnes: AchievementNotification[] = [];

  for (const id of earnedIds) {
    if (!storedIds.includes(id)) {
      const ach = ACHIEVEMENTS.find((a) => a.id === id);
      if (ach) {
        newOnes.push({
          id: ach.id,
          name: ach.name,
          icon: ach.icon,
          timestamp: Date.now(),
        });
      }
    }
  }

  // Save all earned IDs for future reference
  saveEarnedIds(earnedIds);

  return newOnes;
}

export function clearNotifications(ids: string[]) {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(NOTIFICATION_KEY);
  let notifications: AchievementNotification[] = [];
  try { if (raw) notifications = JSON.parse(raw) as AchievementNotification[]; } catch {}
  notifications = notifications.filter((n) => !ids.includes(n.id));
  localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifications));
}

/**
 * Build achievement stats from available data.
 */
export function buildStats(
  simulationsCompleted: number,
  averageScore: number,
  maxScore: number,
  currentStreak: number,
  totalXp: number,
  level: number,
  hardQuestionsCompleted: number,
  scenariosByCategory: Record<string, number>
): AchievementStats {
  return {
    simulationsCompleted,
    averageScore,
    maxScore,
    currentStreak,
    longestStreak: currentStreak, // Use current for the condition check
    totalXp,
    level,
    hardQuestionsCompleted,
    scenariosByCategory: scenariosByCategory || {},
    topSkills: [],
  };
}