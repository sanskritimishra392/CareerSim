import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { answer, scenario } = body;

    if (!answer || !scenario) {
      return NextResponse.json(
        { error: "Missing answer or scenario" },
        { status: 400 }
      );
    }

    // ---------------- SAFE MOCK LOGIC ----------------
    // (NO GEMINI, NO IMPORTS, NO BREAKS)

    const wordCount = answer.trim().split(/\s+/).length;

    const relevance = Math.min(10, 5 + Math.floor(wordCount / 20));
    const clarity = Math.min(10, 6 + Math.floor(Math.random() * 3));
    const reasoning = Math.min(10, 5 + Math.floor(Math.random() * 4));

    const feedback =
      wordCount < 20
        ? "Try giving more detailed answers like a real interview candidate."
        : wordCount < 60
        ? "Good attempt. Add more structured reasoning and examples."
        : "Strong answer. Focus on clarity and structured impact in real interviews.";

    return NextResponse.json({
      relevance,
      clarity,
      reasoning,
      feedback,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Server crashed safely (fallback mode)",
      },
      { status: 500 }
    );
  }
}