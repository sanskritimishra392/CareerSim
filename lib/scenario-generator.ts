import type { ActiveScenario, ScenarioSeed, ScenarioRound, RoundPhase } from "@/lib/scenario-types";
import { XP_BY_DIFFICULTY } from "@/lib/scenario-types";
import { getCompanyName } from "@/lib/scenarios";

const GEMINI_API_KEY = typeof process !== "undefined" ? process.env.GEMINI_API_KEY : undefined;

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set");
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
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

const SCENARIO_SYSTEM_PROMPT = `You are a senior interviewer at top technology companies. Generate realistic workplace simulation scenarios for interview practice.

Each scenario must follow this structure:
- Context (2-3 sentences setting the scene)
- Problem (2-3 sentences describing the issue)
- Constraints (2-4 bullet points listing limitations)
- Questions (2-3 specific questions the candidate should answer)

Requirements:
- Each scenario must be 150-300 words total
- Use realistic, specific technical details (service names, error codes, metrics, timeframes)
- The scenario should feel like a real workplace incident, not a textbook question
- Include specific numbers where relevant (response times, error percentages, user counts)
- Write in second person ("You are the on-call engineer...")`;

function buildSeedPrompt(seed: ScenarioSeed, phase: RoundPhase, level: number): string {
  const phaseDescriptions: Record<RoundPhase, string> = {
    initial: seed.initialPhase,
    "new-evidence": seed.evidencePhase,
    "business-impact": seed.impactPhase,
    postmortem: seed.postmortemPhase,
  };

  return `${SCENARIO_SYSTEM_PROMPT}

Generate a realistic workplace scenario with the following parameters:

Career Level: ${level} (1-based, higher = more senior)
Category: ${seed.category}
Difficulty: ${seed.difficulty}
Phase: ${phase}

Phase Description: ${phaseDescriptions[phase]}

Seed Topic: ${seed.seed}

Output the scenario as valid JSON with exactly these fields:
{
  "context": "string",
  "problem": "string",
  "constraints": "string (with bullet points)",
  "questions": ["string", "string"]
}

IMPORTANT: Return ONLY valid JSON, no markdown formatting or extra text.`;
}

function buildLocalScenario(seed: ScenarioSeed, phase: RoundPhase): { context: string; problem: string; constraints: string; questions: string[] } {
  // Fallback when Gemini is unavailable - generate from seed directly
  const phaseLabels: Record<RoundPhase, string> = {
    initial: "Initial Incident",
    "new-evidence": "New Evidence Appears",
    "business-impact": "Business Impact Escalates",
    postmortem: "Resolution & Postmortem",
  };

  return {
    context: `${seed.seed} — ${phaseLabels[phase]}. You are responsible for investigating and resolving this issue.`,
    problem: `Based on the scenario "${seed.seed}", describe the key technical challenges you face during the ${phaseLabels[phase].toLowerCase()} phase. What systems and data would you investigate?`,
    constraints: "• You have limited information initially\n• Other systems depend on this service\n• Time is critical — users are impacted\n• You must balance speed with thoroughness",
    questions: [
      `What is your immediate response to this ${phaseLabels[phase].toLowerCase()}?`,
      "What tools and data would you use to investigate?",
      "What mitigation steps would you take?",
    ],
  };
}

export async function generateScenario(
  seed: ScenarioSeed,
  level: number,
  careerTitle: string,
  careerKey: string
): Promise<ActiveScenario> {
  const companies = seed.relevantCompanyIds.map((id) => getCompanyName(id)).filter(Boolean);

  const phases: RoundPhase[] = ["initial", "new-evidence", "business-impact", "postmortem"];
  const rounds: ScenarioRound[] = [];

  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    let content: { context: string; problem: string; constraints: string; questions: string[] };

    if (GEMINI_API_KEY) {
      try {
        const prompt = buildSeedPrompt(seed, phase, level);
        const raw = await callGemini(prompt);
        const parsed = JSON.parse(raw);
        content = {
          context: parsed.context || seed.seed,
          problem: parsed.problem || seed.seed,
          constraints: parsed.constraints || "",
          questions: parsed.questions || ["Describe your approach to resolving this situation."],
        };
      } catch (e) {
        console.warn(`Gemini scenario generation failed for phase ${phase}, using fallback:`, e);
        content = buildLocalScenario(seed, phase);
      }
    } else {
      content = buildLocalScenario(seed, phase);
    }

    rounds.push({
      round: (i + 1) as 1 | 2 | 3 | 4,
      phase,
      context: content.context,
      problem: content.problem,
      constraints: content.constraints,
      questions: content.questions,
    });
  }

  const sc: ActiveScenario = {
    id: `${seed.id}-${Date.now()}`,
    careerKey,
    careerTitle,
    category: seed.category,
    difficulty: seed.difficulty,
    level,
    xpReward: XP_BY_DIFFICULTY[seed.difficulty],
    relevantCompanies: companies,
    currentRound: 1,
    totalRounds: rounds.length,
    rounds,
    seed: seed.id,
  };

  return sc;
}

export async function generateFollowUp(
  scenario: ActiveScenario,
  userAnswer: string,
  roundNumber: number
): Promise<{ question: string; context: string }> {
  if (!GEMINI_API_KEY) {
    // Fallback: generate a simple follow-up based on the next round
    const nextRound = scenario.rounds.find((r) => r.round === roundNumber + 1);
    if (nextRound) {
      return {
        question: `The situation has escalated. ${nextRound.context} How do you respond now?`,
        context: nextRound.context,
      };
    }
    return {
      question: "Given your response, what would you do differently if a similar incident occurred again?",
      context: "Reflect on your approach and consider improvements for the future.",
    };
  }

  const currentRound = scenario.rounds.find((r) => r.round === roundNumber);
  const nextRound = scenario.rounds.find((r) => r.round === roundNumber + 1);

  const prompt = `You are a senior interviewer evaluating a candidate's response in a multi-round workplace simulation.

Current Scenario Round: ${roundNumber}
Round Phase: ${currentRound?.phase || "unknown"}
Scenario Category: ${scenario.category}
Scenario Context: ${currentRound?.context || ""}
Problem: ${currentRound?.problem || ""}

Candidate's Response:
${userAnswer}

Next Round Phase: ${nextRound?.phase || "postmortem"}
Next Round Context: ${nextRound?.context || "The incident has been resolved"}

Generate an intelligent follow-up question that:
1. Acknowledges key points from the candidate's response (reference specific things they said)
2. Introduces new information or escalation that changes the situation
3. Tests the candidate's ability to adapt their approach
4. Is specific and realistic — include numbers, service names, or concrete details

Output ONLY valid JSON with no markdown:
{
  "question": "string (the follow-up question)",
  "context": "string (brief context for what changed)"
}`;

  try {
    const raw = await callGemini(prompt);
    const parsed = JSON.parse(raw);
    return {
      question: parsed.question || "How would you adapt your approach given the new circumstances?",
      context: parsed.context || "New information has come to light.",
    };
  } catch (e) {
    console.warn("Follow-up generation failed, using fallback:", e);
    return {
      question: nextRound
        ? `New developments have emerged: ${nextRound.context} How does this change your approach?`
        : "Reflecting on the entire incident, what key lessons would you document for the team?",
      context: nextRound?.context || "The incident has evolved.",
    };
  }
}