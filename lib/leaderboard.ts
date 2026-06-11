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

// ─── Simulated names for leaderboard population ─────────────────

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
    const history = historyRaw ? JSON.parse(historyRaw) : [];

    const now = Date.now();
    const weekAgo = now - 7 * 86400000;
    const monthAgo = now - 30 * 86400000;
    let weeklyXp = 0;
    let monthlyXp = 0;

    for (const r of history) {
      simCount++;
      if (r.scores) {
        const avg = (r.scores.technicalSkill + r.scores.communication + r.scores.decisionMaking) / 3;
        totalScore += avg;
        scoreCount++;
      }
      const submitted = new Date(r.submittedAt).getTime();
      if (submitted >= weekAgo) weeklyXp += 25;
      if (submitted >= monthAgo) monthlyXp += 25;
    }

    const avgScore = scoreCount > 0 ? Math.round((totalScore / scoreCount) * 10) / 10 : 0;
    const streak = streakRaw ? (JSON.parse(streakRaw).currentStreak || 0) : 0;

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
  } catch {
    return null;
  }
}

function generateSimulatedUsers(count: number, realEntry: LeaderboardEntry | null): LeaderboardEntry[] {
  const users: LeaderboardEntry[] = [];
  const usedNames = new Set<string>();

  if (realEntry) usedNames.add(realEntry.displayName);

  // Generate high-XP users to make the leaderboard competitive
  for (let i = 0; i < count; i++) {
    const seed = i + 1;
    let first: string, last: string, name: string;
    do {
      first = pickFrom(FIRST_NAMES, seed * 3 + i);
      last = pickFrom(LAST_NAMES, seed * 7 + i * 13);
      name = `${first} ${last}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    // Generate varied stats — top users have high XP
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

export function getLeaderboard(categoryId: string, limit: number = 100): LeaderboardEntry[] {
  const realEntry = getRealUserEntry();
  let users = generateSimulatedUsers(limit, realEntry);

  // Add real user
  if (realEntry) {
    // Merge real user into the simulated set
    users = users.filter((u) => u.username !== "player");
    users.push(realEntry);
  }

  // Sort based on category
  users.sort((a, b) => {
    switch (categoryId) {
      case "global-xp":
        return b.xp - a.xp;
      case "weekly-xp":
      case "monthly-xp": {
        // Simulate weekly/monthly XP as a fraction of total
        const factor = categoryId === "weekly-xp" ? 0.15 : 0.4;
        const aVal = Math.round(a.xp * factor * (0.5 + Math.random() * 0.5));
        const bVal = Math.round(b.xp * factor * (0.5 + Math.random() * 0.5));
        return bVal - aVal;
      }
      case "longest-streak": {
        // Simulate streak based on XP
        const aStreak = Math.min(365, Math.round(a.xp / 50 + Math.random() * 30));
        const bStreak = Math.min(365, Math.round(b.xp / 50 + Math.random() * 30));
        return bStreak - aStreak;
      }
      case "most-simulations": {
        const aSims = Math.round(a.xp / 25 + Math.random() * 20);
        const bSims = Math.round(b.xp / 25 + Math.random() * 20);
        return bSims - aSims;
      }
      case "highest-average": {
        const aAvg = Math.min(10, Math.round((7 + Math.random() * 3) * 10) / 10);
        const bAvg = Math.min(10, Math.round((7 + Math.random() * 3) * 10) / 10);
        return bAvg - aAvg;
      }
      default:
        return b.xp - a.xp;
    }
  });

  // Assign ranks and format values
  return users.slice(0, limit).map((entry, index) => {
    let value: number;
    let valueLabel: string;

    switch (categoryId) {
      case "global-xp":
        value = entry.xp;
        valueLabel = "XP";
        break;
      case "weekly-xp":
        value = Math.round(entry.xp * 0.15 * (0.5 + Math.random() * 0.5));
        valueLabel = "XP this week";
        break;
      case "monthly-xp":
        value = Math.round(entry.xp * 0.4 * (0.5 + Math.random() * 0.5));
        valueLabel = "XP this month";
        break;
      case "longest-streak":
        value = Math.min(365, Math.round(entry.xp / 50 + Math.random() * 30));
        valueLabel = "day streak";
        break;
      case "most-simulations":
        value = Math.round(entry.xp / 25 + Math.random() * 20);
        valueLabel = "simulations";
        break;
      case "highest-average":
        value = Math.min(10, Math.round((7 + Math.random() * 3) * 10) / 10);
        valueLabel = "avg score";
        break;
      default:
        value = entry.xp;
        valueLabel = "XP";
    }

    return {
      ...entry,
      rank: index + 1,
      value,
      valueLabel:
        valueLabel === "avg score" ? `/10` :
        valueLabel === "XP this week" ? "XP" :
        valueLabel === "XP this month" ? "XP" :
        valueLabel === "day streak" ? "days" :
        valueLabel === "simulations" ? "sims" :
        valueLabel,
    };
  });
}

// ─── Real user helper for UI highlighting ─────────────────────────

export function getRealUsername(): string {
  if (typeof window === "undefined") return "player";
  try {
    const raw = localStorage.getItem("careerSimProfile");
    if (raw) {
      const profile = JSON.parse(raw);
      return profile.username || "player";
    }
  } catch {}
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
  } catch {}
  return "Player";
}