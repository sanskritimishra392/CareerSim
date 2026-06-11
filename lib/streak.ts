export type StreakData = {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
};

export type StreakMilestone = {
  days: number;
  name: string;
  description: string;
  icon: string;
};

export type StreakBadge = {
  id: string;
  milestone: number;
  name: string;
  icon: string;
  color: string;
};

// ─── Milestones ─────────────────────────────────────────────────────

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 1, name: "First Day", description: "Started your streak", icon: "🌱" },
  { days: 3, name: "Getting Started", description: "3-day streak", icon: "🔥" },
  { days: 7, name: "Week Warrior", description: "7-day streak", icon: "⚡" },
  { days: 15, name: "Dedicated", description: "15-day streak", icon: "💪" },
  { days: 30, name: "Unstoppable", description: "30-day streak", icon: "🏆" },
  { days: 50, name: "Half Century", description: "50-day streak", icon: "🌟" },
  { days: 75, name: "Iron Will", description: "75-day streak", icon: "💎" },
  { days: 100, name: "Century Club", description: "100-day streak", icon: "👑" },
  { days: 180, name: "Half Year", description: "180-day streak", icon: "🌋" },
  { days: 365, name: "Year Strong", description: "365-day streak", icon: "⭐" },
  { days: 730, name: "Two-Year Legend", description: "730-day streak", icon: "💫" },
];

export const STREAK_BADGES: StreakBadge[] = [
  { id: "streak-1", milestone: 1, name: "First Day", icon: "🌱", color: "text-emerald-400" },
  { id: "streak-3", milestone: 3, name: "Getting Started", icon: "🔥", color: "text-orange-400" },
  { id: "streak-7", milestone: 7, name: "Week Warrior", icon: "⚡", color: "text-yellow-400" },
  { id: "streak-15", milestone: 15, name: "Dedicated", icon: "💪", color: "text-sky-400" },
  { id: "streak-30", milestone: 30, name: "Unstoppable", icon: "🏆", color: "text-amber-400" },
  { id: "streak-50", milestone: 50, name: "Half Century", icon: "🌟", color: "text-violet-400" },
  { id: "streak-75", milestone: 75, name: "Iron Will", icon: "💎", color: "text-purple-400" },
  { id: "streak-100", milestone: 100, name: "Century Club", icon: "👑", color: "text-rose-400" },
  { id: "streak-180", milestone: 180, name: "Half Year", icon: "🌋", color: "text-red-400" },
  { id: "streak-365", milestone: 365, name: "Year Strong", icon: "⭐", color: "text-fuchsia-400" },
  { id: "streak-730", milestone: 730, name: "Two-Year Legend", icon: "💫", color: "text-cyan-400" },
];

// ─── Storage ────────────────────────────────────────────────────────

const STREAK_STORAGE_KEY = "careerSimStreak";

export function getDefaultStreak(): StreakData {
  return { currentStreak: 0, longestStreak: 0, lastActiveDate: "" };
}

export function getStreakData(): StreakData {
  if (typeof window === "undefined") return getDefaultStreak();
  const raw = localStorage.getItem(STREAK_STORAGE_KEY);
  if (!raw) return getDefaultStreak();
  try {
    return JSON.parse(raw) as StreakData;
  } catch {
    return getDefaultStreak();
  }
}

function saveStreak(data: StreakData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data));
}

// ─── Core streak logic ──────────────────────────────────────────────

/**
 * Updates the streak. Call this whenever a user performs an activity
 * (completes a simulation, visits the simulation page, etc.).
 * 
 * Rules:
 * - If last active date is today → no change (already logged)
 * - If last active date is yesterday → increment streak
 * - If last active date is older → reset streak to 1
 * - If no last active date → set streak to 1
 */
export function updateStreak(): StreakData {
  const now = new Date();
  const today = getDateString(now);
  const data = getStreakData();

  // Already logged today
  if (data.lastActiveDate === today) {
    return data;
  }

  const yesterday = getDateString(new Date(now.getTime() - 86400000));
  let newStreak: number;

  if (data.lastActiveDate === "") {
    // First ever activity
    newStreak = 1;
  } else if (data.lastActiveDate === yesterday) {
    // Consecutive day
    newStreak = data.currentStreak + 1;
  } else {
    // Streak broken
    newStreak = 1;
  }

  const newData: StreakData = {
    currentStreak: newStreak,
    longestStreak: Math.max(data.longestStreak, newStreak),
    lastActiveDate: today,
  };

  saveStreak(newData);
  return newData;
}

// ─── Query helpers ──────────────────────────────────────────────────

/**
 * Returns the streak as of today. Does NOT update it.
 * Use this for display purposes only.
 */
export function getStreakForDisplay(): StreakData {
  const data = getStreakData();
  const today = getDateString(new Date());

  // If last active was yesterday or today, streak is current
  const yesterday = getDateString(new Date(Date.now() - 86400000));
  if (data.lastActiveDate === today || data.lastActiveDate === yesterday) {
    return data;
  }

  // Streak is broken — show 0 for display
  return { ...data, currentStreak: 0 };
}

/**
 * Check if the user was active today.
 */
export function isActiveToday(): boolean {
  const today = getDateString(new Date());
  return getStreakData().lastActiveDate === today;
}

/**
 * Check if the user was active yesterday (streak is still alive).
 */
export function isStreakAlive(): boolean {
  const today = getDateString(new Date());
  const yesterday = getDateString(new Date(Date.now() - 86400000));
  const data = getStreakData();
  return data.lastActiveDate === today || data.lastActiveDate === yesterday;
}

// ─── Milestone helpers ──────────────────────────────────────────────

/**
 * Get the last milestone the user has reached.
 */
export function getLastMilestoneReached(streak: number): StreakMilestone | null {
  let last: StreakMilestone | null = null;
  for (const m of STREAK_MILESTONES) {
    if (streak >= m.days) last = m;
    else break;
  }
  return last;
}

/**
 * Get the next milestone the user is working toward.
 */
export function getNextMilestone(streak: number): StreakMilestone | null {
  for (const m of STREAK_MILESTONES) {
    if (streak < m.days) return m;
  }
  return null;
}

/**
 * Get all badges the user has earned based on their longest streak.
 */
export function getEarnedStreakBadges(streak: number): StreakBadge[] {
  return STREAK_BADGES.filter((b) => streak >= b.milestone);
}

/**
 * Get milestones that the user has completed, in a format suitable
 * for a progress display.
 */
export function getStreakMilestoneProgress(streak: number) {
  return STREAK_MILESTONES.map((m) => ({
    ...m,
    reached: streak >= m.days,
    progress: streak >= m.days ? 100 : Math.round((streak / m.days) * 100),
    daysRemaining: streak >= m.days ? 0 : m.days - streak,
  }));
}

// ─── Date helpers ───────────────────────────────────────────────────

function getDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Get a human-readable description of how the streak is doing.
 */
export function getStreakStatus(streak: number): { label: string; color: string } {
  if (streak === 0) return { label: "Start your streak!", color: "text-zinc-500" };
  if (streak < 3) return { label: "Just getting started", color: "text-emerald-400" };
  if (streak < 7) return { label: "Building momentum", color: "text-emerald-400" };
  if (streak < 15) return { label: "Strong consistency", color: "text-sky-400" };
  if (streak < 30) return { label: "Impressive dedication", color: "text-sky-400" };
  if (streak < 50) return { label: "Unstoppable!", color: "text-violet-400" };
  if (streak < 100) return { label: "Absolutely legendary", color: "text-amber-400" };
  if (streak < 365) return { label: "Elite performer", color: "text-rose-400" };
  return { label: "CareerSim Hall of Fame", color: "text-fuchsia-400" };
}