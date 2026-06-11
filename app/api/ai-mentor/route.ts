import { NextResponse } from "next/server";
import { evaluateWithGemini } from "@/lib/gemini";
import { getMentorPrompt, type AIMentorResult } from "@/lib/ai-mentor-prompt";
import type { CareerKey } from "@/lib/scenarios";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { answer, scenario, careerKey, category, difficulty } = body;

    if (!answer || !scenario) {
      return NextResponse.json(
        { error: "Missing answer or scenario" },
        { status: 400 }
      );
    }

    if (!careerKey) {
      return NextResponse.json(
        { error: "Missing careerKey" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      // Return a structured fallback mentor response when no API key is set
      return NextResponse.json({
        strengths: "Your response addressed the core scenario and showed awareness of the problem domain.",
        weaknesses: "The response could benefit from deeper analytical reasoning and more concrete examples from professional practice.",
        missedConcepts: "Consider incorporating industry-standard frameworks, risk considerations, or broader stakeholder impacts relevant to this domain.",
        improvements: "Structure your response with a clear problem statement, your proposed approach, and a justification of trade-offs made.",
        recommendedTopic: "Review foundational best practices and case studies in your career field to strengthen your reasoning patterns.",
      } satisfies AIMentorResult);
    }

    try {
      const prompt = getMentorPrompt(
        careerKey as CareerKey,
        category,
        difficulty
      );

      const result = await evaluateWithGemini<AIMentorResult>(
        answer,
        scenario,
        prompt
      );

      return NextResponse.json(result);
    } catch (geminiError) {
      console.warn("AI Mentor Gemini call failed:", geminiError);
      // Return fallback so the UI never breaks
      return NextResponse.json({
        strengths: "Your response engaged with the scenario thoughtfully. Continue building on this foundation.",
        weaknesses: "Try adding more structure and depth to your reasoning. Consider multiple perspectives.",
        missedConcepts: "Look into core frameworks and methodologies used by professionals in this field.",
        improvements: "Practice breaking down complex problems into smaller parts and addressing each systematically.",
        recommendedTopic: "Deepen your understanding of core concepts in your chosen career path.",
      } satisfies AIMentorResult);
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "AI Mentor evaluation failed" },
      { status: 500 }
    );
  }
}