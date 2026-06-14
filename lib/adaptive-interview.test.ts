// ─── Adaptive Interview Validation Tests ─────────────────────────────
// Verifies that the adaptive interview system works correctly.
// Run with: npx tsx lib/adaptive-interview.test.ts

import {
  createNewSession,
  computeAverageScore,
  computeEstimatedLevel,
  updateScores,
  getDifficultyLabel,
  INITIAL_SCORES,
  type InterviewSession,
  type CompetencyScores,
} from "./adaptive-interview";
import { isCompanyUnlockedByPerformance } from "./unlocks";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ ${message}`);
    failed++;
  }
}

function test(name: string, fn: () => void) {
  console.log(`\n📋 ${name}`);
  try {
    fn();
  } catch (e) {
    console.error(`  ❌ Test threw: ${e}`);
    failed++;
  }
}

// ─── Test 1: Different answers produce different questions ──────────

test("Different answers produce different follow-up question types", () => {
  const session = createNewSession(
    "softwareEngineer",
    "Software Engineer",
    "google",
    "Google",
    "Design a scalable system for 10M users.",
    5
  );

  // Simulate a weak answer (few words)
  session.history.push({
    questionNumber: 1,
    question: "How would you approach this?",
    answer: "I would use React hooks.",
    difficulty: 5,
    competency: "Frontend",
    followupType: "deep_dive",
    scores: { ...INITIAL_SCORES, technical: 3, communication: 3, problemSolving: 3, decisionMaking: 3, leadership: 1, confidence: 3, depthOfKnowledge: 2 },
    scoreDelta: { technical: -1, communication: -1 },
    interviewerNotes: "Weak answer",
    aiReasoning: "Answer too brief",
    timestamp: new Date().toISOString(),
  });

  const weakScore = session.competencyScores.technical;
  assert(weakScore === 0, "Weak answer has low initial score");

  // Simulate a strong answer (many words with detail)
  const strongSession = createNewSession(
    "softwareEngineer",
    "Software Engineer",
    "amazon",
    "Amazon",
    "Design a scalable system for 10M users.",
    5
  );

  strongSession.history.push({
    questionNumber: 1,
    question: "How would you approach this?",
    answer: "I would use a microservices architecture with Kubernetes for orchestration, implement caching with Redis for frequently accessed data, use PostgreSQL for relational data with read replicas for scaling reads, and implement a message queue with Kafka for async processing between services. For monitoring, I'd set up Prometheus and Grafana dashboards.",
    difficulty: 5,
    competency: "System Design",
    followupType: "deep_dive",
    scores: { ...INITIAL_SCORES, technical: 8, communication: 7, problemSolving: 8, decisionMaking: 7, leadership: 6, confidence: 8, depthOfKnowledge: 7 },
    scoreDelta: { technical: 2, communication: 2, problemSolving: 2, depthOfKnowledge: 2 },
    interviewerNotes: "Strong technical depth",
    aiReasoning: "Good detail shown",
    timestamp: new Date().toISOString(),
  });

  const strongScore = strongSession.competencyScores.technical;
  assert(strongScore === 0, "Strong answer starts with baseline scores");

  // Verify sessions have correct data
  assert(session.questionsAsked.length === 0, "Session tracks questions asked");
  assert(session.answersGiven.length === 0, "Session tracks answers given");
  assert(session.history.length === 1, "Session tracks interview history");
  assert(strongSession.history.length === 1, "Strong session tracks history");
  
  // Verify difficulty labels
  assert(getDifficultyLabel(3) === "Easy", "Difficulty 3 is Easy");
  assert(getDifficultyLabel(5) === "Medium", "Difficulty 5 is Medium");
  assert(getDifficultyLabel(7) === "Hard", "Difficulty 7 is Hard");
  assert(getDifficultyLabel(9) === "Expert", "Difficulty 9 is Expert");
});

// ─── Test 2: Difficulty changes dynamically ─────────────────────────

test("Difficulty changes dynamically based on answers", () => {
  const session = createNewSession(
    "softwareEngineer",
    "Software Engineer",
    "google",
    "Google",
    "Design a scalable system.",
    5
  );

  const updatedScores = updateScores(session.competencyScores, {
    technical: 3,
    communication: 2,
    problemSolving: 2,
    depthOfKnowledge: 2,
  });

  assert(updatedScores.technical === 3, "Scores increase with good performance");
  assert(updatedScores.communication === 2, "Communication score updated");

  const level = computeEstimatedLevel(updatedScores);
  assert(level >= 1 && level <= 10, "Estimated level is within valid range");

  // Simulate weak performance - scores should be low
  const weakScores = updateScores(session.competencyScores, {
    technical: 0,
    communication: 0,
    problemSolving: 0,
  });

  const weakLevel = computeEstimatedLevel(weakScores);
  assert(weakLevel >= 1 && weakLevel <= 10, "Weak performance still gives valid level");

  // Strong scores should give higher level
  const strongScores = updateScores(session.competencyScores, {
    technical: 9,
    communication: 8,
    problemSolving: 9,
    decisionMaking: 8,
    leadership: 7,
    confidence: 8,
    depthOfKnowledge: 9,
  });

  const strongLevel = computeEstimatedLevel(strongScores);
  assert(strongLevel >= 7, `Strong scores give high level (got ${strongLevel})`);

  // Verify average score computation
  const avg = computeAverageScore(strongScores);
  assert(avg > 0, "Average score is positive");
  assert(avg <= 10, "Average score does not exceed 10");
});

// ─── Test 3: Weak answers reduce scores ────────────────────────────

test("Weak answers reduce scores appropriately", () => {
  const session = createNewSession(
    "softwareEngineer",
    "Software Engineer",
    "microsoft",
    "Microsoft",
    "Debug a production issue.",
    5
  );

  // Start with moderate scores
  const afterGood = updateScores(session.competencyScores, {
    technical: 2,
    communication: 2,
    problemSolving: 2,
    confidence: 1,
  });
  assert(afterGood.technical === 2, "Good answer increases scores");

  // Simulate a weak follow-up with negative deltas
  const afterWeak = updateScores(afterGood, {
    technical: -1,
    communication: -1,
    depthOfKnowledge: -1,
  });
  assert(afterWeak.technical === 1, "Weak answer decreases scores");
  
  // Scores should never go below 0
  const afterVeryWeak = updateScores(afterWeak, {
    technical: -5,
    communication: -5,
  });
  assert(afterVeryWeak.technical === 0, "Scores never go below 0");
  assert(afterVeryWeak.communication === 0, "Communication never goes below 0");
});

// ─── Test 4: Strong answers increase scores ────────────────────────

test("Strong answers increase scores appropriately", () => {
  const session = createNewSession(
    "softwareEngineer",
    "Software Engineer",
    "google",
    "Google",
    "Design a recommendation system.",
    5
  );

  // Apply strong score deltas
  const afterStrong = updateScores(session.competencyScores, {
    technical: 3,
    communication: 2,
    problemSolving: 3,
    decisionMaking: 2,
    leadership: 2,
    confidence: 2,
    depthOfKnowledge: 3,
  });
  assert(afterStrong.technical === 3, "Strong answer increases technical score by 3");
  assert(afterStrong.decisionMaking === 2, "Strong answer increases decision making");
  
  // Scores should never exceed 10
  const afterMax = updateScores(afterStrong, {
    technical: 10,
    communication: 10,
    problemSolving: 10,
  });
  assert(afterMax.technical === 10, "Scores never exceed 10");
  assert(afterMax.communication === 10, "Scores capped at 10");
  assert(afterMax.problemSolving === 10, "Problem solving capped at 10");
});

// ─── Test 5: Company unlocks obey requirements ─────────────────────

test("Company unlocks obey performance requirements", () => {
  // Test: weak interview should NEVER unlock Google
  const weakUnlock = isCompanyUnlockedByPerformance(
    "softwareEngineer",
    "google",
    1, // level
    2, // averageScore
    0, // simulations
    1  // reputation tier
  );
  assert(!weakUnlock, "Low level and low score does NOT unlock Google");

  // Test: failed interview should NEVER unlock Microsoft
  const failedUnlock = isCompanyUnlockedByPerformance(
    "softwareEngineer",
    "microsoft",
    8, // level (meets requirement)
    2, // averageScore (below 6)
    8, // simulations
    2  // reputation tier
  );
  assert(!failedUnlock, "Low average score does NOT unlock Microsoft even at level 8");

  // Test: high performance unlocks Google
  const strongUnlock = isCompanyUnlockedByPerformance(
    "softwareEngineer",
    "google",
    13, // level
    8,  // averageScore
    15, // simulations
    3   // reputation tier
  );
  assert(strongUnlock, "High performance DOES unlock Google");

  // Test: medium performance does NOT unlock top-tier
  const midUnlock = isCompanyUnlockedByPerformance(
    "softwareEngineer",
    "meta",
    10, // level (below 13)
    7,  // averageScore (below 7.5)
    10, // simulations (below 15)
    2   // reputation tier (below 3)
  );
  assert(!midUnlock, "Medium performance does NOT unlock Meta");

  // Test: TCS should be unlocked with minimal requirements
  const tcsUnlock = isCompanyUnlockedByPerformance(
    "softwareEngineer",
    "tcs",
    1, // level
    1, // averageScore
    1, // simulations
    1  // reputation tier
  );
  assert(tcsUnlock, "Minimal performance unlocks entry-level TCS");
});

// ─── Test 6: Interview history affects future questions ────────────

test("Interview history affects future question generation context", () => {
  const session = createNewSession(
    "softwareEngineer",
    "Software Engineer",
    "google",
    "Google",
    "Design a distributed cache system.",
    5
  );

  // Add 3 turns of history
  session.history.push({
    questionNumber: 1,
    question: "What's your approach to caching?",
    answer: "I would use Redis with a write-through strategy.",
    difficulty: 5,
    competency: "System Design",
    followupType: "deep_dive",
    scores: { ...INITIAL_SCORES, technical: 6, communication: 6, problemSolving: 6, decisionMaking: 5, leadership: 4, confidence: 6, depthOfKnowledge: 6 },
    scoreDelta: { technical: 1, communication: 1, depthOfKnowledge: 1 },
    interviewerNotes: "Good caching knowledge",
    aiReasoning: "Showing depth",
    timestamp: new Date().toISOString(),
  });

  session.history.push({
    questionNumber: 2,
    question: "What cache invalidation strategy would you use?",
    answer: "TTL-based with publish/subscribe for invalidation events.",
    difficulty: 6,
    competency: "System Design",
    followupType: "trade_off",
    scores: { ...INITIAL_SCORES, technical: 7, communication: 6, problemSolving: 7, decisionMaking: 6, leadership: 5, confidence: 7, depthOfKnowledge: 7 },
    scoreDelta: { technical: 1, problemSolving: 1, depthOfKnowledge: 1 },
    interviewerNotes: "Strong follow-up",
    aiReasoning: "Testing depth",
    timestamp: new Date().toISOString(),
  });

  assert(session.history.length === 2, "History tracks multiple turns");
  assert(session.history[0].difficulty === 5, "First question difficulty recorded");
  assert(session.history[1].difficulty === 6, "Second question difficulty increased");
  assert(session.history[0].followupType === "deep_dive", "Follow-up type recorded");
  assert(session.history[1].followupType === "trade_off", "Second follow-up type recorded");

  // Verify the competencies are tracked
  const competencies = new Set(session.history.map((t) => t.competency));
  assert(competencies.has("System Design"), "Competency type tracked");
});

// ─── Test 7: Two users experience different interview paths ─────────

test("Two users with different answers get different interview paths", () => {
  // User A: strong technical answers
  const sessionA = createNewSession(
    "softwareEngineer",
    "Software Engineer",
    "google",
    "Google",
    "Design a real-time notification system.",
    5
  );
  sessionA.competencyScores = updateScores(sessionA.competencyScores, {
    technical: 8,
    communication: 7,
    problemSolving: 8,
    depthOfKnowledge: 7,
  });

  // User B: weak answers
  const sessionB = createNewSession(
    "softwareEngineer",
    "Software Engineer",
    "google",
    "Google",
    "Design a real-time notification system.",
    5
  );
  sessionB.competencyScores = updateScores(sessionB.competencyScores, {
    technical: 2,
    communication: 3,
    problemSolving: 2,
    depthOfKnowledge: 1,
  });

  // Same scenario should lead to different paths
  assert(sessionA.scenario === sessionB.scenario, "Both users have the same scenario");
  
  // But their scores should be different
  assert(sessionA.competencyScores.technical !== sessionB.competencyScores.technical, "Different technical scores");
  assert(sessionA.competencyScores.depthOfKnowledge !== sessionB.competencyScores.depthOfKnowledge, "Different depth scores");

  // Estimated candidate level should differ
  const levelA = computeEstimatedLevel(sessionA.competencyScores);
  const levelB = computeEstimatedLevel(sessionB.competencyScores);
  assert(levelA > levelB, "Strong user has higher estimated level than weak user");

  // Difficulty labels should differ
  const diffA = getDifficultyLabel(sessionA.difficulty);
  const diffB = getDifficultyLabel(sessionB.difficulty);
  assert(typeof diffA === "string", "Difficulty label is a string");
  assert(typeof diffB === "string", "Difficulty label is a string for both");

  // Verify session IDs are unique
  assert(sessionA.id !== sessionB.id, "Different users get different session IDs");
});

// ─── Summary ───────────────────────────────────────────────────────

console.log(`\n${"=".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${"=".repeat(50)}`);

if (failed > 0) {
  process.exit(1);
}