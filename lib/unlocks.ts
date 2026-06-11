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