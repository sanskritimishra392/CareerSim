import { NextResponse } from "next/server";
import { evaluateWithGemini } from "@/lib/gemini";
import { getEvaluationPrompt } from "@/lib/evaluation-prompts";
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
        const geminiResult = await evaluateWithGemini<{
          scorePercentage: number;
          passed: boolean;
          breakdown: { relevance: number; clarity: number; reasoning: number };
          feedback: string;
          xpReason: string;
        }>(answer, scenario, prompt);

        // Compute XP from Gemini's scorePercentage
        let xpEarned = 0;
        const sp = geminiResult.scorePercentage;
        if (sp >= 90) xpEarned = 100;
        else if (sp >= 80) xpEarned = 75;
        else if (sp >= 70) xpEarned = 50;
        else if (sp >= 60) xpEarned = 25;
        else xpEarned = 0;

        return NextResponse.json({
          scorePercentage: sp,
          xpEarned,
          passed: sp >= 70,
          breakdown: geminiResult.breakdown || { relevance: 5, clarity: 5, reasoning: 5 },
          feedback: geminiResult.feedback || "Evaluation complete.",
          xpReason: geminiResult.xpReason || computeXpReason(sp),
        });
      } catch (geminiError) {
        console.warn("Gemini evaluation failed, falling back to local:", geminiError);
      }
    }

    // Fallback: use local evaluator
    const result = evaluateResponse(answer);

    return NextResponse.json({
      scorePercentage: result.scorePercentage,
      xpEarned: result.xpEarned,
      passed: result.passed,
      breakdown: result.breakdown,
      feedback: result.feedback,
      xpReason: result.xpReason,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Evaluation failed" },
      { status: 500 }
    );
  }
}

function computeXpReason(scorePercentage: number): string {
  if (scorePercentage >= 90) return "Outstanding response! You demonstrated expert-level reasoning.";
  if (scorePercentage >= 80) return "Excellent response with strong reasoning and clear communication.";
  if (scorePercentage >= 70) return "Good response showing solid understanding of the scenario.";
  if (scorePercentage >= 60) return "Adequate response. Try adding more technical detail.";
  return "Below passing score. Focus on directly addressing the problem.";
}