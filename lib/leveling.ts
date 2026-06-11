export const XP_STORAGE_KEY = "careerSimXp";
export const XP_PER_LEVEL = 100;

export type Difficulty = "easy" | "medium" | "hard";

export const XP_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 10,
  medium: 25,
  hard: 50,
};

export function getXpForDifficulty(difficulty: Difficulty): number {
  return XP_BY_DIFFICULTY[difficulty];
}

export function getStoredXp(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(XP_STORAGE_KEY);
  const xp = raw ? Number(raw) : 0;
  return Number.isFinite(xp) && xp >= 0 ? xp : 0;
}

export function saveStoredXp(xp: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(XP_STORAGE_KEY, String(Math.max(0, xp)));
}

export function addXp(amount: number) {
  const current = getStoredXp();
  const next = current + amount;
  saveStoredXp(next);
  return next;
}

export function getLevelForXp(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInCurrentLevel = xp % XP_PER_LEVEL;
  const progress = xpInCurrentLevel / XP_PER_LEVEL;
  const xpToNext = XP_PER_LEVEL - xpInCurrentLevel;
  const currentLevelXp = (level - 1) * XP_PER_LEVEL;
  const nextLevelXp = level * XP_PER_LEVEL;

  return {
    level,
    xpInCurrentLevel,
    progress,
    xpToNext,
    currentLevelXp,
    nextLevelXp,
  };
}

export const difficultyLabels: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};
