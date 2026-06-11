export interface EvaluationResult {
  relevance: number;
  clarity: number;
  reasoning: number;
  xpGained: number;
  feedback: string;
}

const keywordSets = {
  problem: ["login", "sign in", "authentication", "auth", "credentials", "password", "sign-in"],
  impact: ["user impact", "customer", "users", "customers", "experience", "UX", "blocked", "unable to"],
  debugging: ["debug", "debugging", "logs", "trace", "monitor", "monitoring", "inspect", "investigate"],
  testing: ["test", "testing", "unit test", "integration", "regression", "QA", "automated test"],
  rootCause: ["root cause", "root-cause", "cause", "analysis", "investigate", "diagnose", "diagnosis"],
  communication: ["communicate", "communication", "stakeholder", "status", "update", "team", "align", "inform"],
};

const nonsensePatterns = [/asdf|qwerty|lorem ipsum|kjh|zzzz|xxxxx|yolo|hahah/i, /[a-z]{5,}\d{2,}/i];

function normalize(text: string) {
  return text.toLowerCase();
}

function countMatches(text: string, patterns: string[]) {
  return patterns.reduce((count, keyword) => (text.includes(keyword) ? count + 1 : count), 0);
}

function detectGibberish(text: string) {
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

export function evaluateResponse(answer: string): EvaluationResult {
  const trimmed = answer.trim();
  const normalized = normalize(trimmed);
  const words = normalized.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentenceCount = Math.max(1, (trimmed.match(/[.!?]+/g) || []).length);

  const isShort = wordCount < 12 || trimmed.length < 60;
  const isGibberish = detectGibberish(trimmed);

  const problemHits = countMatches(normalized, keywordSets.problem);
  const impactHits = countMatches(normalized, keywordSets.impact);
  const debugHits = countMatches(normalized, keywordSets.debugging);
  const testHits = countMatches(normalized, keywordSets.testing);
  const rootCauseHits = countMatches(normalized, keywordSets.rootCause);
  const communicationHits = countMatches(normalized, keywordSets.communication);

  const insightHits = impactHits + debugHits + testHits + rootCauseHits + communicationHits;
  const topicHits = Math.min(5, problemHits + insightHits);

  let relevance = Math.min(10, Math.max(1, topicHits * 2));
  let clarity = Math.min(10, Math.max(1, Math.round(Math.min(10, wordCount / 12 + sentenceCount * 0.5))));
  let reasoning = Math.min(10, Math.max(1, Math.round((debugHits + rootCauseHits + Math.min(2, problemHits)) * 2 + Math.min(3, wordCount / 50))));

  if (isShort) {
    relevance = Math.max(1, relevance - 2);
    clarity = Math.max(1, clarity - 2);
    reasoning = Math.max(1, reasoning - 2);
  }

  if (isGibberish) {
    relevance = 1;
    clarity = 1;
    reasoning = 1;
  }

  if (debugHits > 0) {
    reasoning = Math.min(10, reasoning + 1);
  }
  if (testHits > 0 || communicationHits > 0) {
    clarity = Math.min(10, clarity + 1);
  }
  if (impactHits > 0 || rootCauseHits > 0) {
    relevance = Math.min(10, relevance + 1);
  }

  const xpGained = Math.max(5, Math.min(40, relevance + clarity + reasoning + 4));

  let feedbackLines: string[] = [];

  if (isGibberish) {
    feedbackLines = [
      "Your answer looks like gibberish or contains too many unrelated characters.",
      "Try writing a meaningful, complete response that directly addresses the scenario.",
      "Focus on the user's issue and describe your next steps clearly.",
    ];
  } else if (isShort) {
    feedbackLines = [
      "Your answer is a bit short and would benefit from more detail.",
      "Try explaining what you would check, why it matters, and how you would verify the fix.",
    ];
  } else {
    feedbackLines.push(
      impactHits
        ? "Nice work mentioning user impact — that shows you understand how this issue affects customers."
        : "Try calling out the customer or user impact more clearly in your response."
    );
    feedbackLines.push(
      debugHits || testHits
        ? "Good: you referenced technical practices like debugging and testing that help make your response actionable."
        : "Consider mentioning debugging steps, testing, or log review to strengthen your evaluation."
    );
    feedbackLines.push(
      rootCauseHits
        ? "You also focused on root cause analysis, which is key for strong engineering decisions."
        : "Add more root cause analysis so your response explains why the issue is happening, not just what to do next."
    );
    feedbackLines.push(
      communicationHits
        ? "Your response includes communication thinking, which helps make technical decisions easier to execute with a team."
        : "Think about how you would communicate the problem and progress to others while resolving it."
    );
  }

  feedbackLines.push(`XP awarded: ${xpGained}. Keep improving the clarity and technical reasoning of your answers.`);

  return {
    relevance,
    clarity,
    reasoning,
    xpGained,
    feedback: feedbackLines.join("\n\n"),
  };
}
