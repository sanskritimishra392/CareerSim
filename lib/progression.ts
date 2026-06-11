export interface SkillProgress {
  xp: number;
  level: number;
}

const XP_PER_LEVEL = 100;

export function addSkillXP(
  current: SkillProgress,
  gainedXP: number
): SkillProgress {
  const newXP = current.xp + gainedXP;

  const newLevel = Math.floor(newXP / XP_PER_LEVEL);

  return {
    xp: newXP,
    level: newLevel,
  };
}

export function getLevelProgress(xp: number) {
  return {
    level: Math.floor(xp / XP_PER_LEVEL),
    progress: (xp % XP_PER_LEVEL) / XP_PER_LEVEL,
  };
}