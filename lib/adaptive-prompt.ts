// ─── Adaptive Interview Prompt Builder ────────────────────────────────
// Builds the system prompt for Gemini to generate adaptive interview questions.
// Every answer influences the next question, difficulty, scoring, and path.

import type { InterviewSession, CompetencyScores, InterviewTurn } from "@/lib/adaptive-interview";
import { getCareerByKey } from "@/lib/careers";
import type { CareerKey } from "@/lib/scenarios";

export type AdaptiveQuestionResponse = {
  question: string;
  difficulty: number;
  competency: string;
  reasoning: string;
  scoreDelta: Partial<CompetencyScores>;
  interviewerNotes: string;
  followupType: "deep_dive" | "clarification" | "challenge" | "behavioral" | "system_design" | "edge_case" | "trade_off" | "implementation" | "why" | "example_request" | "revisit";
  stage: "opening" | "technical_deep_dive" | "behavioral" | "system_design" | "scaling_challenge" | "wrap_up";
};

export function buildAdaptiveSystemPrompt(careerKey: string): string {
  const career = getCareerByKey(careerKey as CareerKey);
  const role = career?.evaluatorRole ?? "professional";

  return `You are a senior technical interviewer at a top company conducting a ${role} interview. Your goal is to create a realistic, adaptive interview experience.

BEHAVIOR RULES:
1. NEVER ask generic or scripted questions. Every question must be a direct response to the candidate's last answer.
2. If the candidate gives a strong answer → increase difficulty, ask deeper questions, edge cases, architecture, trade-offs.
3. If the candidate gives a weak answer → ask clarification questions, simpler concepts, guided follow-ups.
4. If the candidate gives a vague answer → ask "Can you walk me through the implementation step-by-step?"
5. If the candidate makes a technical mistake → ask "Can you explain why that approach would scale?"
6. If the candidate gives an excellent answer → increase difficulty and ask deeper questions.
7. Challenge assumptions, ask "why?", request examples, request implementation details, ask trade-offs, ask edge cases.
8. The interview should feel conversational, not scripted.

SCORING RULES:
- scoreDelta values should be -2 to +3 based on answer quality
- technical: for technical depth, correctness, system knowledge
- communication: for clarity, structure, explanation quality
- problemSolving: for approach, methodology, debugging skill
- decisionMaking: for trade-off analysis, choice justification
- leadership: for ownership, mentoring, incident leadership
- confidence: for decisiveness, clarity of conviction
- depthOfKnowledge: for deep understanding vs surface-level

DIFFICULTY SCALE (1-10):
1-3: Easy - basic concepts, definitions, simple scenarios
4-5: Medium - moderate complexity, some trade-offs
6-7: Hard - complex scenarios, architecture, edge cases
8-10: Expert - deep systems, novel problems, research-level

You MUST respond with ONLY valid JSON in this exact format, no markdown or extra text:
{
  "question": "string - the next interview question",
  "difficulty": number 1-10,
  "competency": "string - e.g. System Design, Debugging, Architecture",
  "reasoning": "string - why you chose this follow-up",
  "scoreDelta": {
    "technical": number -2 to 3,
    "communication": number -2 to 3,
    "problemSolving": number -2 to 3,
    "decisionMaking": number -2 to 3,
    "leadership": number -2 to 3,
    "confidence": number -2 to 3,
    "depthOfKnowledge": number -2 to 3
  },
  "interviewerNotes": "string - your assessment of the answer",
  "followupType": "deep_dive | clarification | challenge | behavioral | system_design | edge_case | trade_off | implementation | why | example_request | revisit",
  "stage": "opening | technical_deep_dive | behavioral | system_design | scaling_challenge | wrap_up"
}`;
}

export function buildAdaptiveUserPrompt(session: InterviewSession, lastAnswer: string): string {
  const scores = session.competencyScores;
  const history = session.history;

  const previousQuestions = history.map((t) => t.question).join("\n");
  const previousAnswers = history.map((t) => t.answer).join("\n");

  return `INTERVIEW CONTEXT:
- Role: ${session.careerTitle}
- Company: ${session.companyName}
- Career Track: ${session.careerKey}
- Current Difficulty Level: ${session.difficulty}/10
- Current Interview Stage: ${session.stage}
- Estimated Candidate Level: ${session.estimatedCandidateLevel}/10

SCENARIO DETAILS:
${session.scenario}

COMPETENCY SCORES SO FAR:
- Technical: ${scores.technical}/10
- Communication: ${scores.communication}/10
- Problem Solving: ${scores.problemSolving}/10
- Decision Making: ${scores.decisionMaking}/10
- Leadership: ${scores.leadership}/10
- Confidence: ${scores.confidence}/10
- Depth of Knowledge: ${scores.depthOfKnowledge}/10

PREVIOUS QUESTIONS ASKED:
${previousQuestions || "None yet - this is the first question."}

PREVIOUS ANSWERS GIVEN:
${previousAnswers || "None yet."}

CANDIDATE'S LATEST ANSWER:
${lastAnswer}

INTERVIEW HISTORY (${history.length} turns so far):
${history.map((t) => `Q${t.questionNumber} [${t.followupType}] (diff:${t.difficulty}): ${t.question.substring(0, 80)}...`).join("\n")}

IDENTIFIED STRENGTHS: ${session.strengths.join(", ") || "Not yet identified"}
IDENTIFIED WEAKNESSES: ${session.weaknesses.join(", ") || "Not yet identified"}

Generate the next interview question based on the candidate's latest answer. Consider the entire interview history, current scores, and adapt the difficulty accordingly.`;
}

export function buildEvaluationPrompt(
  answer: string,
  question: string,
  careerKey: string,
  difficulty: number
): string {
  const career = getCareerByKey(careerKey as CareerKey);
  const role = career?.evaluatorRole ?? "professional";

  return `You are an expert ${role} interviewer evaluating a candidate's response.

Question asked: "${question}"
Difficulty level: ${difficulty}/10
Candidate's answer: "${answer}"

Evaluate this answer on a scale of 1-10 for each dimension:
- technical: Technical accuracy and depth
- communication: Clarity and structure
- problemSolving: Problem-solving approach
- decisionMaking: Trade-off analysis and decision quality
- leadership: Ownership and leadership signals
- confidence: Decisiveness and clarity
- depthOfKnowledge: Depth vs surface-level understanding

Also identify:
- strengths: What the candidate did well (comma-separated list)
- weaknesses: Areas for improvement (comma-separated list)
- estimatedLevel: Estimated candidate level 1-10
- feedback: Constructive feedback (2-3 sentences)

You MUST respond with ONLY valid JSON in this exact format, no markdown or extra text:
{
  "technical": number 1-10,
  "communication": number 1-10,
  "problemSolving": number 1-10,
  "decisionMaking": number 1-10,
  "leadership": number 1-10,
  "confidence": number 1-10,
  "depthOfKnowledge": number 1-10,
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"],
  "estimatedLevel": number 1-10,
  "feedback": "string"
}`;
}