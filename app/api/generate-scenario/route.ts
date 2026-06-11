import { NextResponse } from "next/server";
import { getSeedForLevel, slugToCareerKey } from "@/lib/scenarios";
import { generateScenario } from "@/lib/scenario-generator";
import { getCareerByKey } from "@/lib/careers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { careerKey: careerSlug, level: rawLevel } = body;

    if (!careerSlug) {
      return NextResponse.json(
        { error: "Missing careerKey" },
        { status: 400 }
      );
    }

    const level = typeof rawLevel === "number" && rawLevel >= 1 ? rawLevel : 1;
    const internalKey = slugToCareerKey(careerSlug);
    const career = internalKey ? getCareerByKey(internalKey) : null;

    if (!internalKey || !career) {
      return NextResponse.json(
        { error: "Invalid career key" },
        { status: 400 }
      );
    }

    const seed = getSeedForLevel(internalKey, level);
    if (!seed) {
      return NextResponse.json(
        { error: "No scenario available for this career and level" },
        { status: 404 }
      );
    }

    const scenario = await generateScenario(seed, level, career.title, careerSlug);

    return NextResponse.json(scenario);
  } catch (err) {
    console.error("Scenario generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate scenario" },
      { status: 500 }
    );
  }
}