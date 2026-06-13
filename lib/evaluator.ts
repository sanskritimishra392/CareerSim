export interface EvaluationResult {
  scorePercentage: number;
  xpEarned: number;
  passed: boolean;
  breakdown: {
    relevance: number;
    clarity: number;
    reasoning: number;
  };
  feedback: string;
  xpReason: string;
}

const nonsensePatterns = [/asdf|qwerty|lorem ipsum|kjh|zzzz|xxxxx|yolo|hahah|test test|blah blah/i, /[a-z]{5,}\d{2,}/i];

function normalize(text: string) {
  return text.toLowerCase();
}

function countMatches(text: string, patterns: string[]) {
  return patterns.reduce((count, keyword) => (text.includes(keyword) ? count + 1 : count), 0);
}

const keywordSets = {
  problem: ["login", "sign in", "authentication", "auth", "credentials", "password", "sign-in", "error", "bug", "issue", "failure", "crash", "outage", "degrad"],
  impact: ["user impact", "customer", "users", "customers", "experience", "UX", "blocked", "unable to", "revenue", "lost", "downtime", "sla"],
  debugging: ["debug", "debugging", "logs", "trace", "monitor", "monitoring", "inspect", "investigate", "check", "examine", "review", "analyze"],
  testing: ["test", "testing", "unit test", "integration", "regression", "QA", "automated test", "validate", "verification"],
  rootCause: ["root cause", "root-cause", "cause", "analysis", "investigate", "diagnose", "diagnosis", "why", "because", "due to"],
  communication: ["communicate", "communication", "stakeholder", "status", "update", "team", "align", "inform", "notify", "escalate"],
};

function detectGibberish(text: string): boolean {
  const normalized = normalize(text);
  if (nonsensePatterns.some((pattern) => pattern.test(normalized))) {
    return true;
  }

  const words = normalized.split(/\s+/).filter(Boolean);
  const shortWordCount = words.filter((word) => /[^a-z]/.test(word)).length;
  if (words.length > 0 && shortWordCount / words.length > 0.4) {
    return true;
  }

  const vowelCount = (normalized.match(/[aeiou]/g) || []).length;
  const vowelRatio = normalized.length > 0 ? vowelCount / normalized.length : 0;
  return vowelRatio < 0.3 && words.length > 5;
}

function isLowEffortOrNonsense(text: string): boolean {
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Very short answers are low effort
  if (wordCount < 10 || trimmed.length < 40) return true;

  // Gibberish detection
  if (detectGibberish(trimmed)) return true;

  return false;
}

function computeScorePercentage(answer: string): { score: number; relevance: number; clarity: number; reasoning: number; details: string[] } {
  const trimmed = answer.trim();
  const normalized = normalize(trimmed);
  const words = normalized.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentenceCount = Math.max(1, (trimmed.match(/[.!?]+/g) || []).length);

  const details: string[] = [];

  // Check for low-effort / nonsense
  if (isLowEffortOrNonsense(trimmed)) {
    details.push("Response is too short, low-effort, or contains gibberish.");
    return { score: 0, relevance: 1, clarity: 1, reasoning: 1, details };
  }

  // Score dimensions (each 0-10)
  const problemHits = countMatches(normalized, keywordSets.problem);
  const impactHits = countMatches(normalized, keywordSets.impact);
  const debugHits = countMatches(normalized, keywordSets.debugging);
  const testHits = countMatches(normalized, keywordSets.testing);
  const rootCauseHits = countMatches(normalized, keywordSets.rootCause);
  const communicationHits = countMatches(normalized, keywordSets.communication);

  // Relevance: addressing the core issue
  const relevance = Math.min(10, Math.max(1, Math.round((problemHits * 1.5 + impactHits) / 2 + 1)));
  if (impactHits > 0) details.push("Good: highlighted user/customer impact.");
  else details.push("Tip: mention how the issue affects users or customers.");

  // Clarity: well-structured, adequate length
  let clarity = Math.min(10, Math.max(1, Math.round(Math.min(10, wordCount / 15 + sentenceCount * 0.5))));
  if (wordCount > 100) clarity = Math.min(10, clarity + 1);
  if (wordCount > 200) clarity = Math.min(10, clarity + 1);
  if (communicationHits > 0) clarity = Math.min(10, clarity + 1);

  // Reasoning: debugging, root cause analysis
  let reasoning = Math.min(10, Math.max(1, Math.round((debugHits * 1.5 + rootCauseHits * 2) / 2 + 1)));
  if (debugHits > 0 || rootCauseHits > 0) details.push("Good: demonstrated technical reasoning with debugging or root cause analysis.");
  else details.push("Tip: include debugging steps or root cause analysis.");
  if (testHits > 0) reasoning = Math.min(10, reasoning + 1);
  if (wordCount > 80) reasoning = Math.min(10, reasoning + 1);

  if (communicationHits > 0) details.push("Good: showed communication and stakeholder awareness.");

  // Calculate weighted score (max 30 = 100%)
  const total = relevance + clarity + reasoning;
  const maxScore = 30;
  const percentage = Math.round((total / maxScore) * 100);

  details.push(`Response length: ${wordCount} words, ${sentenceCount} sentences.`);

  return { score: Math.min(100, Math.max(0, percentage)), relevance, clarity, reasoning, details };
}

function computeXp(scorePercentage: number): { xp: number; reason: string } {
  if (scorePercentage >= 90) {
    return { xp: 100, reason: "Outstanding response! You demonstrated expert-level reasoning and clarity." };
  } else if (scorePercentage >= 80) {
    return { xp: 75, reason: "Excellent response with strong reasoning and clear communication." };
  } else if (scorePercentage >= 70) {
    return { xp: 50, reason: "Good response showing solid understanding of the scenario." };
  } else if (scorePercentage >= 60) {
    return { xp: 25, reason: "Adequate response. Try adding more technical detail and structured reasoning." };
  } else if (scorePercentage >= 1) {
    return { xp: 0, reason: "Below passing score. Focus on directly addressing the problem with clear technical reasoning." };
  } else {
    return { xp: 0, reason: "Response was too short, irrelevant, or nonsensical. 0 XP awarded." };
  }
}

export function evaluateResponse(answer: string): EvaluationResult {
  const { score, relevance, clarity, reasoning, details } = computeScorePercentage(answer);
  const { xp, reason: xpReason } = computeXp(score);

  const passed = score >= 70;

  // Build feedback text
  const feedbackParts = [...details];
  if (score < 60) {
    feedbackParts.push(`\nYour answer scored ${score}%. To pass (70%), focus on: identifying the core problem, explaining your reasoning step by step, and mentioning user impact.`);
  } else if (score < 70) {
    feedbackParts.push(`\nAlmost there! You scored ${score}%. You need 70% to pass. Add more technical depth and structured reasoning.`);
  } else {
    feedbackParts.push(`\nPassed with ${score}%! ${xpReason}`);
  }

  return {
    scorePercentage: score,
    xpEarned: xp,
    passed,
    breakdown: { relevance, clarity, reasoning },
    feedback: feedbackParts.join("\n\n"),
    xpReason,
  };
}