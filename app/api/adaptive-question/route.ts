import { NextResponse } from "next/server";
import type { InterviewSession } from "@/lib/adaptive-interview";
import { buildAdaptiveSystemPrompt, buildAdaptiveUserPrompt, type AdaptiveQuestionResponse } from "@/lib/adaptive-prompt";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set");
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.8,
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

function generateFallbackQuestion(session: InterviewSession, lastAnswer: string): AdaptiveQuestionResponse {
  const turnCount = session.history.length;
  const wordCount = lastAnswer.trim().split(/\s+/).length;
  const isWeakAnswer = wordCount < 15;
  const isStrongAnswer = wordCount > 80;

  // Adaptive fallback that varies based on answer quality and history
  const followups = [
    {
      question: "Can you walk me through your thought process in more detail? What specific steps would you take?",
      difficulty: Math.max(1, session.difficulty - 1),
      competency: "Problem Solving",
      reasoning: "Candidate gave a brief answer, asking for elaboration",
      scoreDelta: { communication: -1, depthOfKnowledge: -1 },
      interviewerNotes: "Answer lacked detail",
      followupType: "clarification" as const,
      stage: "technical_deep_dive" as const,
    },
    {
      question: "That's an interesting approach. What trade-offs did you consider, and why did you choose this over alternatives?",
      difficulty: Math.min(10, session.difficulty + 1),
      competency: "Decision Making",
      reasoning: "Candidate showed depth, probing for trade-off analysis",
      scoreDelta: { decisionMaking: 2, depthOfKnowledge: 1 },
      interviewerNotes: "Good technical depth, testing decision-making",
      followupType: "trade_off" as const,
      stage: "technical_deep_dive" as const,
    },
    {
      question: "How would this solution scale if we had 10x the traffic? What bottlenecks would you expect?",
      difficulty: Math.min(10, session.difficulty + 2),
      competency: "System Design",
      reasoning: "Testing scalability thinking",
      scoreDelta: { technical: 2, problemSolving: 1 },
      interviewerNotes: "Probing for scalability awareness",
      followupType: "deep_dive" as const,
      stage: "scaling_challenge" as const,
    },
    {
      question: "What edge cases might break your approach? How would you handle them?",
      difficulty: session.difficulty,
      competency: "Problem Solving",
      reasoning: "Testing edge case awareness",
      scoreDelta: { depthOfKnowledge: 1, problemSolving: 1 },
      interviewerNotes: "Testing thoroughness",
      followupType: "edge_case" as const,
      stage: "technical_deep_dive" as const,
    },
    {
      question: "Can you give me a specific example from your experience where you handled a similar situation?",
      difficulty: session.difficulty,
      competency: "Behavioral",
      reasoning: "Requesting real-world example",
      scoreDelta: { communication: 1, confidence: 1 },
      interviewerNotes: "Testing for real experience vs theoretical knowledge",
      followupType: "example_request" as const,
      stage: "behavioral" as const,
    },
  ];

  // Pick based on answer quality
  let index: number;
  if (isWeakAnswer) {
    index = 0; // Ask for clarification
  } else if (isStrongAnswer) {
    index = 2; // Increase difficulty
  } else if (turnCount % 3 === 0) {
    index = 4; // Behavioral check
  } else if (turnCount % 2 === 0) {
    index = 3; // Edge cases
  } else {
    index = 1; // Trade-offs
  }

  return followups[index % followups.length];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { session, lastAnswer } = body as { session: InterviewSession; lastAnswer: string };

    if (!session || !lastAnswer) {
      return NextResponse.json(
        { error: "Missing session or lastAnswer" },
        { status: 400 }
      );
    }

    // Try Gemini first
    if (GEMINI_API_KEY) {
      try {
        const systemPrompt = buildAdaptiveSystemPrompt(session.careerKey);
        const userPrompt = buildAdaptiveUserPrompt(session, lastAnswer);
        const raw = await callGemini(systemPrompt, userPrompt);
        const parsed = JSON.parse(raw) as AdaptiveQuestionResponse;

        return NextResponse.json({
          question: parsed.question,
          difficulty: Math.max(1, Math.min(10, parsed.difficulty)),
          competency: parsed.competency || "General",
          reasoning: parsed.reasoning || "Based on candidate's response",
          scoreDelta: parsed.scoreDelta || {},
          interviewerNotes: parsed.interviewerNotes || "",
          followupType: parsed.followupType || "deep_dive",
          stage: parsed.stage || "technical_deep_dive",
        });
      } catch (geminiError) {
        console.warn("Gemini adaptive question failed, using fallback:", geminiError);
      }
    }

    // Fallback: use deterministic adaptive logic
    const fallback = generateFallbackQuestion(session, lastAnswer);
    return NextResponse.json(fallback);
  } catch (err) {
    console.error("Adaptive question generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate adaptive question" },
      { status: 500 }
    );
  }
}