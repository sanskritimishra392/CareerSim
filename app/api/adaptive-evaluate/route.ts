import { NextResponse } from "next/server";
import type { CompetencyScores } from "@/lib/adaptive-interview";
import { buildEvaluationPrompt } from "@/lib/adaptive-prompt";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export type AdaptiveEvaluationResult = {
  technical: number;
  communication: number;
  problemSolving: number;
  decisionMaking: number;
  leadership: number;
  confidence: number;
  depthOfKnowledge: number;
  strengths: string[];
  weaknesses: string[];
  estimatedLevel: number;
  feedback: string;
};

async function callGemini(systemPrompt: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

function localEvaluation(answer: string, difficulty: number): AdaptiveEvaluationResult {
  const wordCount = answer.trim().split(/\s+/).length;
  const sentenceCount = Math.max(1, (answer.match(/[.!?]+/g) || []).length);
  const avgSentenceLength = wordCount / sentenceCount;

  // Heuristic scoring
  const technical = Math.min(10, Math.max(1, Math.round(
    (wordCount > 20 ? 4 : 2) +
    (wordCount > 50 ? 2 : 0) +
    (wordCount > 100 ? 2 : 0) +
    (avgSentenceLength > 12 ? 1 : 0) +
    (difficulty > 5 ? 1 : 0)
  )));

  const communication = Math.min(10, Math.max(1, Math.round(
    4 +
    (sentenceCount >= 3 ? 2 : 0) +
    (sentenceCount >= 5 ? 2 : 0) +
    (avgSentenceLength > 10 ? 1 : 0) +
    (wordCount > 30 ? 1 : 0)
  )));

  const problemSolving = Math.min(10, Math.max(1, Math.round(
    (wordCount > 30 ? 4 : 2) +
    (wordCount > 70 ? 2 : 0) +
    (wordCount > 120 ? 2 : 0) +
    (difficulty > 5 ? 1 : 0) +
    (sentenceCount >= 4 ? 1 : 0)
  )));

  const decisionMaking = Math.min(10, Math.max(1, Math.round(
    3 + (wordCount > 40 ? 2 : 0) + (wordCount > 80 ? 2 : 0) + (avgSentenceLength > 14 ? 2 : 0) + (difficulty > 4 ? 1 : 0)
  )));

  const leadership = Math.min(10, Math.max(1, Math.round(
    2 + (wordCount > 50 ? 2 : 0) + (wordCount > 100 ? 2 : 0) + (difficulty > 5 ? 2 : 0) + (sentenceCount >= 4 ? 2 : 0)
  )));

  const confidence = Math.min(10, Math.max(1, Math.round(
    4 + (avgSentenceLength > 10 ? 2 : 0) + (wordCount > 40 ? 2 : 0) + (sentenceCount <= 6 ? 2 : 0)
  )));

  const depthOfKnowledge = Math.min(10, Math.max(1, Math.round(
    (wordCount > 30 ? 3 : 1) +
    (wordCount > 80 ? 2 : 0) +
    (wordCount > 150 ? 2 : 0) +
    (avgSentenceLength > 15 ? 2 : 0) +
    (difficulty > 5 ? 1 : 0)
  )));

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (technical >= 7) strengths.push("Strong technical knowledge");
  else weaknesses.push("Could deepen technical accuracy");

  if (communication >= 7) strengths.push("Clear communication");
  else weaknesses.push("Could improve answer structure");

  if (problemSolving >= 7) strengths.push("Good problem-solving approach");
  else weaknesses.push("Could show more structured reasoning");

  if (decisionMaking >= 7) strengths.push("Strong decision-making");
  else weaknesses.push("Could discuss trade-offs more");

  const avgScore = (technical + communication + problemSolving + decisionMaking + leadership + confidence + depthOfKnowledge) / 7;
  const estimatedLevel = Math.max(1, Math.min(10, Math.round(avgScore)));

  let feedback: string;
  if (avgScore >= 8) {
    feedback = "Excellent response! You demonstrated strong understanding and clear reasoning. Keep challenging yourself with harder concepts.";
  } else if (avgScore >= 6) {
    feedback = "Good answer with solid foundations. Try adding more specific technical details and discussing trade-offs to strengthen your response.";
  } else if (avgScore >= 4) {
    feedback = "Decent attempt. Focus on structuring your answer more clearly and providing concrete examples from your experience.";
  } else {
    feedback = "Your answer could be more detailed. Try explaining your thought process step by step and referencing specific technologies or approaches.";
  }

  return {
    technical,
    communication,
    problemSolving,
    decisionMaking,
    leadership,
    confidence,
    depthOfKnowledge,
    strengths,
    weaknesses,
    estimatedLevel,
    feedback,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { answer, question, careerKey, difficulty } = body as {
      answer: string;
      question: string;
      careerKey: string;
      difficulty: number;
    };

    if (!answer || !question) {
      return NextResponse.json(
        { error: "Missing answer or question" },
        { status: 400 }
      );
    }

    // Try Gemini evaluation first
    if (GEMINI_API_KEY && careerKey) {
      try {
        const prompt = buildEvaluationPrompt(answer, question, careerKey, difficulty || 5);
        const raw = await callGemini(prompt);
        const parsed = JSON.parse(raw) as AdaptiveEvaluationResult;

        return NextResponse.json({
          technical: Math.max(1, Math.min(10, parsed.technical)),
          communication: Math.max(1, Math.min(10, parsed.communication)),
          problemSolving: Math.max(1, Math.min(10, parsed.problemSolving)),
          decisionMaking: Math.max(1, Math.min(10, parsed.decisionMaking)),
          leadership: Math.max(1, Math.min(10, parsed.leadership)),
          confidence: Math.max(1, Math.min(10, parsed.confidence)),
          depthOfKnowledge: Math.max(1, Math.min(10, parsed.depthOfKnowledge)),
          strengths: parsed.strengths || [],
          weaknesses: parsed.weaknesses || [],
          estimatedLevel: Math.max(1, Math.min(10, parsed.estimatedLevel || 5)),
          feedback: parsed.feedback || "Evaluation complete.",
        });
      } catch (geminiError) {
        console.warn("Gemini evaluation failed, using fallback:", geminiError);
      }
    }

    // Fallback: use heuristic evaluation
    const result = localEvaluation(answer, difficulty || 5);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Adaptive evaluation error:", err);
    return NextResponse.json(
      { error: "Evaluation failed" },
      { status: 500 }
    );
  }
}