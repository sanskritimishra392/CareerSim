export type Difficulty = "easy" | "medium" | "hard";

export type RoundPhase = "initial" | "new-evidence" | "business-impact" | "postmortem";

export type ScenarioRound = {
  round: 1 | 2 | 3 | 4;
  phase: RoundPhase;
  context: string;
  problem: string;
  constraints: string;
  questions: string[];
};

export type ActiveScenario = {
  id: string;
  careerKey: string;
  careerTitle: string;
  category: string;
  difficulty: Difficulty;
  level: number;
  xpReward: number;
  relevantCompanies: string[];
  currentRound: number;
  totalRounds: number;
  rounds: ScenarioRound[];
  seed: string;
};

export type ScenarioFollowUp = {
  round: number;
  phase: RoundPhase;
  question: string;
  context: string;
};

export const XP_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 50,
  medium: 100,
  hard: 150,
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export const PHASE_LABELS: Record<RoundPhase, string> = {
  initial: "Initial Incident",
  "new-evidence": "New Evidence Appears",
  "business-impact": "Business Impact Escalates",
  postmortem: "Resolution & Postmortem",
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  medium: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  hard: "text-red-400 border-red-500/30 bg-red-500/10",
};

export type ScenarioSeed = {
  id: string;
  careerKey: string;
  category: string;
  seed: string;
  initialPhase: string;
  evidencePhase: string;
  impactPhase: string;
  postmortemPhase: string;
  difficulty: Difficulty;
  minLevel: number;
  maxLevel: number;
  relevantCompanyIds: string[];
};

// ─── Evaluation types ──────────────────────────────────────────────

export type EvaluationBreakdown = {
  relevance: number;
  clarity: number;
  reasoning: number;
};

export type EvaluationResult = {
  scorePercentage: number;
  xpEarned: number;
  passed: boolean;
  breakdown: EvaluationBreakdown;
  feedback: string;
  xpReason: string;
};

// ─── Seed tracking ─────────────────────────────────────────────────

export const RECENT_SEEDS_KEY = "careerSimRecentSeeds";
export const MAX_RECENT_SEEDS = 10;

export function getRecentSeedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEEDS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function addRecentSeedId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const recent = getRecentSeedIds();
    const updated = [id, ...recent.filter((s) => s !== id)].slice(0, MAX_RECENT_SEEDS);
    localStorage.setItem(RECENT_SEEDS_KEY, JSON.stringify(updated));
  } catch {
    // localStorage not available
  }
}