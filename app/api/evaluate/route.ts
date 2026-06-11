import { NextResponse } from "next/server";
import { evaluateWithGemini } from "@/lib/gemini";
import { getEvaluationPrompt } from "@/lib/evaluation-prompts";
import { getCareerByKey } from "@/lib/careers";
import { evaluateResponse } from "@/lib/evaluator";
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

    // Try Gemini evaluation first, fall back to local evaluator
    if (careerKey && process.env.GEMINI_API_KEY) {
      try {
        const prompt = getEvaluationPrompt(
          careerKey as CareerKey,
          category,
          difficulty
        );
        const result = await evaluateWithGemini<{
          relevance: number;
          clarity: number;
          reasoning: number;
          xpGained: number;
          feedback: string;
        }>(answer, scenario, prompt);

        return NextResponse.json(result);
      } catch (geminiError) {
        console.warn("Gemini evaluation failed, falling back to local:", geminiError);
      }
    }

    // Fallback: use local evaluator
    const result = evaluateResponse(answer);

    return NextResponse.json({
      relevance: result.relevance,
      clarity: result.clarity,
      reasoning: result.reasoning,
      feedback: result.feedback,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Evaluation failed" },
      { status: 500 }
    );
  }
}