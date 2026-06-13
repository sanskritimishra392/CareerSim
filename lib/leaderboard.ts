export type LeaderboardEntry = {
  rank: number;
  username: string;
  displayName: string;
  level: number;
  xp: number;
  career: string;
  avatarInitials: string;
  value: number;
  valueLabel: string;
};

export type LeaderboardCategory = {
  id: string;
  label: string;
  icon: string;
  description: string;
  valueLabel: string;
};

export const LEADERBOARD_CATEGORIES: LeaderboardCategory[] = [
  { id: "global-xp", label: "Global XP", icon: "⚡", description: "Highest total XP earned", valueLabel: "XP" },
  { id: "weekly-xp", label: "Weekly XP", icon: "📈", description: "Most XP earned this week", valueLabel: "XP" },
  { id: "monthly-xp", label: "Monthly XP", icon: "📊", description: "Most XP earned this month", valueLabel: "XP" },
  { id: "longest-streak", label: "Longest Streak", icon: "🔥", description: "Longest daily streak", valueLabel: "days" },
  { id: "most-simulations", label: "Most Simulations", icon: "🎮", description: "Most simulations completed", valueLabel: "sims" },
  { id: "highest-average", label: "Highest Avg Score", icon: "💯", description: "Highest average score", valueLabel: "avg" },
];

const FIRST_NAMES = [
  "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Quinn", "Avery",
  "Sage", "Rowan", "Ellis", "Drew", "Reese", "Skyler", "Spencer", "Parker",
  "Harper", "Cameron", "Blake", "Dakota", "Aiden", "Emma", "Liam", "Olivia",
  "Noah", "Sophia", "Ethan", "Ava", "Mason", "Isabella", "Lucas", "Mia",
  "Leo", "Zara", "Kai", "Luna", "Asher", "Stella", "Felix", "Nova",
];

const LAST_NAMES = [
  "Chen", "Patel", "Kim", "Singh", "Wang", "Brown", "Davis", "Miller",
  "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White",
  "Harris", "Martin", "Garcia", "Martinez", "Robinson", "Clark", "Lewis",
  "Lee", "Walker", "Hall", "Allen", "Young", "King", "Wright", "Scott",
  "Green", "Baker", "Adams", "Nelson", "Hill", "Ramirez", "Campbell", "Mitchell",
];

const CAREERS = [
  "Software Engineer", "Doctor", "Lawyer", "Investment Banker",
  "Product Manager", "Data Scientist",
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function pickFrom<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}

function generateInitials(first: string, last: string): string {
  return `${first[0]}${last[0]}`;
}

function getRealUserEntry(): LeaderboardEntry | null {
  if (typeof window === "undefined") return null;

  try {
    const profileRaw = localStorage.getItem("careerSimProfile");
    const xpRaw = localStorage.getItem("careerSimXp");
    const xp = xpRaw ? Number(xpRaw) : 0;
    const level = Math.floor(xp / 100) + 1;
    const historyRaw = localStorage.getItem("careerSimHistory");
    const streakRaw = localStorage.getItem("careerSimStreak");

    const profile = profileRaw ? JSON.parse(profileRaw) : {};
    const displayName = profile.displayName || "Player";
    const initials = profile.avatarInitials || displayName.slice(0, 2).toUpperCase();
    const careerTrack = profile.careerTrack || "Not started";

    let simCount = 0;
    let totalScore = 0;
    let scoreCount = 0;
    let weeklyXp = 0;
    let monthlyXp = 0;
    const historyRawParsed = historyRaw ? JSON.parse(historyRaw) : [];
    // Guard: ensure history is an array (handle malformed data)
    const history = Array.isArray(historyRawParsed) ? historyRawParsed : [];

    const now = Date.now();
    const weekAgo = now - 7 * 86400000;
    const monthAgo = now - 30 * 86400000;

    for (const r of history) {
      if (!r || typeof r !== "object") continue;
      simCount++;
      if (r.scores && typeof r.scores === "object") {
        const tech = typeof r.scores.technicalSkill === "number" ? r.scores.technicalSkill : 0;
        const comm = typeof r.scores.communication === "number" ? r.scores.communication : 0;
        const dec = typeof r.scores.decisionMaking === "number" ? r.scores.decisionMaking : 0;
        const avg = (tech + comm + dec) / 3;
        totalScore += avg;
        scoreCount++;
      }
      if (r.submittedAt) {
        const submitted = new Date(r.submittedAt).getTime();
        if (!isNaN(submitted)) {
          if (submitted >= weekAgo) weeklyXp += 25;
          if (submitted >= monthAgo) monthlyXp += 25;
        }
      }
    }

    const avgScore = scoreCount > 0 ? Math.round((totalScore / scoreCount) * 10) / 10 : 0;
    const streakData = streakRaw ? JSON.parse(streakRaw) : {};
    const streak = (streakData && typeof streakData === "object" ? streakData.currentStreak : 0) || 0;

    return {
      rank: 0,
      username: "player",
      displayName,
      level,
      xp,
      career: careerTrack === "Not started" ? "CareerSim Player" : careerTrack,
      avatarInitials: initials,
      value: xp,
      valueLabel: "XP",
    };
  } catch (err) {
    console.warn("[Leaderboard] getRealUserEntry error:", err);
    return null;
  }
}

function generateSimulatedUsers(count: number, realEntry: LeaderboardEntry | null): LeaderboardEntry[] {
  const users: LeaderboardEntry[] = [];
  const usedNames = new Set<string>();

  if (realEntry) usedNames.add(realEntry.displayName);

  for (let i = 0; i < count; i++) {
    const seed = i + 1;
    let first: string, last: string, name: string;
    let retries = 0;
    do {
      // Vary the seed on each retry so we don't generate the same colliding name forever
      const retryOffset = retries * 7919;
      first = pickFrom(FIRST_NAMES, seed * 3 + i + retryOffset);
      last = pickFrom(LAST_NAMES, seed * 7 + i * 13 + retryOffset);
      name = `${first} ${last}`;
      retries++;
      // Safety valve: prevent infinite loop if all 1520 combos are somehow used
      if (retries > 2000) break;
    } while (usedNames.has(name));
    if (retries > 2000) continue;
    usedNames.add(name);

    const baseXp = Math.max(0, Math.round(5000 - i * 45 + (seededRandom(seed * 11) - 0.5) * 200));
    const xp = Math.max(50, baseXp);
    const level = Math.floor(xp / 100) + 1;

    users.push({
      rank: 0,
      username: name.toLowerCase().replace(/\s/g, "."),
      displayName: name,
      level,
      xp,
      career: pickFrom(CAREERS, seed * 17 + i * 5),
      avatarInitials: generateInitials(first, last),
      value: xp,
      valueLabel: "XP",
    });
  }

  return users;
}

function getCategoryValue(entry: LeaderboardEntry, categoryId: string, index: number): { value: number; label: string } {
  const seed = index * 31 + 7;
  switch (categoryId) {
    case "global-xp":
      return { value: entry.xp, label: "XP" };
    case "weekly-xp":
      return { value: Math.round(entry.xp * 0.15 * (0.5 + seededRandom(seed) * 0.5)), label: "XP" };
    case "monthly-xp":
      return { value: Math.round(entry.xp * 0.4 * (0.5 + seededRandom(seed) * 0.5)), label: "XP" };
    case "longest-streak":
      return { value: Math.min(365, Math.round(entry.xp / 50 + seededRandom(seed) * 30)), label: "days" };
    case "most-simulations":
      return { value: Math.round(entry.xp / 25 + seededRandom(seed) * 20), label: "sims" };
    case "highest-average":
      return { value: Math.min(10, Math.round((7 + seededRandom(seed) * 3) * 10) / 10), label: "/10" };
    default:
      return { value: entry.xp, label: "XP" };
  }
}

export function getLeaderboard(categoryId: string, limit: number = 100): LeaderboardEntry[] {
  try {
    const realEntry = getRealUserEntry();
    let users = generateSimulatedUsers(limit, realEntry);

    // Add real user
    if (realEntry) {
      users = users.filter((u) => u.username !== "player");
      users.push(realEntry);
    }

    // Pre-compute category values deterministically by index
    const withValues = users.map((u, i) => {
      const cv = getCategoryValue(u, categoryId, i);
      return { ...u, categoryValue: cv.value, categoryLabel: cv.label };
    });

    // Sort by pre-computed value (stable comparator)
    withValues.sort((a, b) => b.categoryValue - a.categoryValue);

    // Assign ranks and return
    return withValues.slice(0, limit).map((entry, index) => ({
      rank: index + 1,
      username: entry.username,
      displayName: entry.displayName,
      level: entry.level,
      xp: entry.xp,
      career: entry.career,
      avatarInitials: entry.avatarInitials,
      value: entry.categoryValue,
      valueLabel: entry.categoryLabel,
    }));
  } catch (err) {
    console.error("[Leaderboard] getLeaderboard error:", err);
    return [];
  }
}

export function getRealUsername(): string {
  if (typeof window === "undefined") return "player";
  try {
    const raw = localStorage.getItem("careerSimProfile");
    if (raw) {
      const profile = JSON.parse(raw);
      return profile.username || "player";
    }
  } catch (err) {
    console.warn("[Leaderboard] getRealUsername error:", err);
  }
  return "player";
}

export function getRealDisplayName(): string {
  if (typeof window === "undefined") return "Player";
  try {
    const raw = localStorage.getItem("careerSimProfile");
    if (raw) {
      const profile = JSON.parse(raw);
      return profile.displayName || "Player";
    }
  } catch (err) {
    console.warn("[Leaderboard] getRealDisplayName error:", err);
  }
  return "Player";
}