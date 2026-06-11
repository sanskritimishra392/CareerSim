import { NextResponse } from "next/server";
import { generateFollowUp } from "@/lib/scenario-generator";
import type { ActiveScenario } from "@/lib/scenario-types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { scenario, userAnswer, roundNumber } = body;

    if (!scenario || !userAnswer) {
      return NextResponse.json(
        { error: "Missing scenario or userAnswer" },
        { status: 400 }
      );
    }

    const followUp = await generateFollowUp(
      scenario as ActiveScenario,
      userAnswer,
      roundNumber || 1
    );

    return NextResponse.json(followUp);
  } catch (err) {
    console.error("Follow-up generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate follow-up" },
      { status: 500 }
    );
  }
}