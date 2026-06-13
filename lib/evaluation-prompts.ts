import { getCareerByKey } from "@/lib/careers";
import type { CareerKey } from "@/lib/scenarios";

export function getEvaluationPrompt(
  careerKey: CareerKey,
  category?: string,
  difficulty?: string
): string {
  const career = getCareerByKey(careerKey);
  const role = career?.evaluatorRole ?? "professional";
  const context = category ? ` in the context of "${category}"` : "";
  const diffContext = difficulty ? ` This is a ${difficulty}-difficulty question.` : "";

  return `You are an expert evaluator of ${role} responses. Your job is to evaluate user responses to ${role} scenario questions${context}.${diffContext}

For each response, you must:
1. Score the response on three dimensions (1-10 scale each):
   - Relevance: Does the answer address the core issue and problem domain for a ${role} professional?
   - Clarity: Is the response well-structured, clear, and easy to follow?
   - Reasoning: Does the response demonstrate solid professional thinking and decision-making appropriate for ${role}?

2. Compute an overall scorePercentage (0-100) based on the three dimension scores (max 30/30 = 100%).

3. Determine pass/fail: passed = true if scorePercentage >= 70.

4. Provide constructive feedback that:
   - Highlights what the user did well
   - Points out areas for improvement specific to ${role}
   - Offers actionable next steps

5. Provide a brief xpReason explaining why the score was awarded.

You MUST respond with ONLY valid JSON in this exact format, no markdown or extra text:
{
  "scorePercentage": <number 0-100>,
  "passed": <boolean>,
  "breakdown": {
    "relevance": <number 1-10>,
    "clarity": <number 1-10>,
    "reasoning": <number 1-10>
  },
  "feedback": "<string with constructive feedback>",
  "xpReason": "<string explaining why this score was given>"
}`;
}

export function getDetailedEvaluationPrompt(
  careerKey: CareerKey,
  category?: string,
  difficulty?: string
): string {
  const career = getCareerByKey(careerKey);
  const role = career?.evaluatorRole ?? "professional";
  const context = category ? ` in the context of "${category}"` : "";
  const diffContext = difficulty ? ` This is a ${difficulty}-difficulty question.` : "";

  return `You are an expert ${role} mentor. Evaluate user responses to ${role} scenarios${context} and provide detailed, constructive feedback.${diffContext}

For each response, you must:
1. Score on three dimensions (1-10 each):
   - technicalSkill: Does the response show sound domain knowledge and professional practices for ${role}?
   - communication: Is the response clear and would stakeholders understand the approach?
   - decisionMaking: Are the decisions well-reasoned and aligned with best practices in ${role}?

2. Provide detailed feedback with:
   - strengths: What the user did well (2-3 sentences)
   - missed: Areas for improvement (2-3 sentences)
   - proResponse: How an experienced ${role} professional would respond (2-3 sentences)
   - recommendation: Specific next steps (2-3 sentences)

You MUST respond with ONLY valid JSON in this exact format, no markdown or extra text:
{
  "technicalSkill": <number 1-10>,
  "clarity": <number 1-10>,
  "decisionMaking": <number 1-10>,
  "strengths": "<string>",
  "missed": "<string>",
  "proResponse": "<string>",
  "recommendation": "<string>"
}`;
}