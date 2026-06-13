import { GoogleGenerativeAI } from "@google/generative-ai";


const DEFAULT_GENERATION_CONFIG = {
  temperature: 0.7,
  topP: 0.95,
  maxOutputTokens: 1024,
};

function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  return new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: DEFAULT_GENERATION_CONFIG,
  });
}

function buildPrompt(answer: string, scenario?: string) {
  return scenario
    ? `Scenario: ${scenario}\n\nUser Response: ${answer}`
    : `User Response: ${answer}`;
}

function extractTextFromResponse(response: unknown): string | null {
  if (typeof response === "string") {
    return response;
  }

  if (!response || typeof response !== "object") {
    return null;
  }

  const candidateList = (response as Record<string, unknown>).candidates;
  if (!Array.isArray(candidateList) || candidateList.length === 0) {
    return null;
  }

  const candidate = candidateList[0] as Record<string, unknown>;
  const content = candidate.content;

  if (Array.isArray(content)) {
    for (const part of content) {
      if (part && typeof part === "object" && typeof (part as Record<string, unknown>).text === "string") {
        return (part as Record<string, unknown>).text as string;
      }
    }
  }

  if (content && typeof (content as Record<string, unknown>).text === "string") {
    return (content as Record<string, unknown>).text as string;
  }

  const parts = (content as Record<string, unknown>)?.parts;
  if (Array.isArray(parts)) {
    for (const part of parts) {
      if (part && typeof part === "object" && typeof (part as Record<string, unknown>).text === "string") {
        return (part as Record<string, unknown>).text as string;
      }
    }
  }

  return null;
}

function parseGeminiJson<T>(text: string): T {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse JSON from Gemini response");
  }

  return JSON.parse(jsonMatch[0]) as T;
}

export async function evaluateWithGemini<T>(
  answer: string,
  scenario: string | undefined,
  systemPrompt: string
): Promise<T> {
  const model = getGeminiModel();
  const prompt = buildPrompt(answer, scenario);

  const response = await model.generateContent({
    systemInstruction: systemPrompt,
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  const textContent = extractTextFromResponse(response);
  if (!textContent) {
    throw new Error("No text content returned by Gemini");
  }

  return parseGeminiJson<T>(textContent);
}
