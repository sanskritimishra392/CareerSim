// ─── Adaptive Interview Engine ─────────────────────────────────────────
// Core types and state management for the AI-driven adaptive interview system.
// Replaces the old fixed-question-flow with a fully dynamic, context-aware interviewer.

export type CompetencyScores = {
  technical: number;
  communication: number;
  problemSolving: number;
  decisionMaking: number;
  leadership: number;
  confidence: number;
  depthOfKnowledge: number;
};

export type FollowUpType =
  | "deep_dive"
  | "clarification"
  | "challenge"
  | "behavioral"
  | "system_design"
  | "edge_case"
  | "trade_off"
  | "implementation"
  | "why"
  | "example_request"
  | "revisit";

export type AdaptiveQuestion = {
  question: string;
  difficulty: number; // 1-10 scale
  competency: string; // e.g. "System Design", "Debugging", "Architecture"
  reasoning: string; // why the AI chose this follow-up
  scoreDelta: Partial<CompetencyScores>; // how this question relates to scoring
  interviewerNotes: string;
  followupType: FollowUpType;
};

export type InterviewTurn = {
  questionNumber: number;
  question: string;
  answer: string;
  difficulty: number;
  competency: string;
  followupType: FollowUpType;
  scores: CompetencyScores;
  scoreDelta: Partial<CompetencyScores>;
  interviewerNotes: string;
  aiReasoning: string;
  timestamp: string;
};

export type InterviewStage =
  | "opening"
  | "technical_deep_dive"
  | "behavioral"
  | "system_design"
  | "scaling_challenge"
  | "wrap_up";

export type InterviewSession = {
  id: string;
  careerKey: string;
  careerTitle: string;
  companyId: string;
  companyName: string;
  scenario: string;
  difficulty: number; // current dynamic difficulty 1-10
  stage: InterviewStage;
  estimatedCandidateLevel: number; // 1-10 based on performance
  competencyScores: CompetencyScores;
  questionsAsked: string[];
  answersGiven: string[];
  history: InterviewTurn[];
  strengths: string[];
  weaknesses: string[];
  startedAt: string;
  completed: boolean;
};

// ─── Score helpers ──────────────────────────────────────────────────────

export const INITIAL_SCORES: CompetencyScores = {
  technical: 0,
  communication: 0,
  problemSolving: 0,
  decisionMaking: 0,
  leadership: 0,
  confidence: 0,
  depthOfKnowledge: 0,
};

export function createNewSession(
  careerKey: string,
  careerTitle: string,
  companyId: string,
  companyName: string,
  scenario: string,
  initialDifficulty: number = 5
): InterviewSession {
  return {
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    careerKey,
    careerTitle,
    companyId,
    companyName,
    scenario,
    difficulty: initialDifficulty,
    stage: "opening",
    estimatedCandidateLevel: 5,
    competencyScores: { ...INITIAL_SCORES },
    questionsAsked: [],
    answersGiven: [],
    history: [],
    strengths: [],
    weaknesses: [],
    startedAt: new Date().toISOString(),
    completed: false,
  };
}

export function computeAverageScore(scores: CompetencyScores): number {
  const values = Object.values(scores);
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function computeEstimatedLevel(scores: CompetencyScores): number {
  const avg = computeAverageScore(scores);
  if (avg <= 1) return 1;
  if (avg <= 2) return 2;
  if (avg <= 3) return 3;
  if (avg <= 4) return 4;
  if (avg <= 5) return 5;
  if (avg <= 6) return 6;
  if (avg <= 7) return 7;
  if (avg <= 8) return 8;
  if (avg <= 9) return 9;
  return 10;
}

export function updateScores(
  current: CompetencyScores,
  delta: Partial<CompetencyScores>
): CompetencyScores {
  const updated = { ...current };
  for (const [key, value] of Object.entries(delta)) {
    const k = key as keyof CompetencyScores;
    updated[k] = Math.max(0, Math.min(10, (updated[k] ?? 0) + (value ?? 0)));
  }
  return updated;
}

export function getDifficultyLabel(difficulty: number): string {
  if (difficulty <= 3) return "Easy";
  if (difficulty <= 5) return "Medium";
  if (difficulty <= 7) return "Hard";
  return "Expert";
}

export function getDifficultyColor(difficulty: number): string {
  if (difficulty <= 3) return "text-emerald-400";
  if (difficulty <= 5) return "text-amber-400";
  if (difficulty <= 7) return "text-orange-400";
  return "text-red-400";
}