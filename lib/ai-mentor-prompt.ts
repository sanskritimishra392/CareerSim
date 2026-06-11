import { getCareerByKey } from "@/lib/careers";
import type { CareerKey } from "@/lib/scenarios";

export interface AIMentorResult {
  strengths: string;
  weaknesses: string;
  missedConcepts: string;
  improvements: string;
  recommendedTopic: string;
}

export function getMentorPrompt(
  careerKey: CareerKey,
  category?: string,
  difficulty?: string
): string {
  const career = getCareerByKey(careerKey);
  const role = career?.evaluatorRole ?? "professional";
  const context = category ? ` in the context of "${category}"` : "";
  const diffContext = difficulty ? ` This is a ${difficulty}-difficulty question.` : "";

  return `You are an expert AI mentor for ${role} professionals. Analyze the user's response to a ${role} scenario question${context}.${diffContext}

For each response, provide a comprehensive mentorship analysis covering:

1. **strengths**: What the user did well — specific techniques, reasoning patterns, or domain knowledge they demonstrated (2-3 sentences).
2. **weaknesses**: Areas where the response fell short — gaps in logic, missing details, or ineffective approaches (2-3 sentences).
3. **missedConcepts**: Key concepts, frameworks, or professional practices the user failed to address or consider (2-3 sentences).
4. **improvements**: Specific, actionable suggestions for how the user can improve their response and professional approach (2-3 sentences).
5. **recommendedTopic**: A specific next topic or skill area the user should study next based on their performance, formatted as a clear single recommendation (1 sentence).

Be constructive, specific, and direct. Avoid generic praise. Tailor your analysis to the ${role} domain.

You MUST respond with ONLY valid JSON in this exact format, no markdown or extra text:
{
  "strengths": "<string>",
  "weaknesses": "<string>",
  "missedConcepts": "<string>",
  "improvements": "<string>",
  "recommendedTopic": "<string>"
}`;
}