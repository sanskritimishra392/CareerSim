"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { InterviewSession, InterviewTurn, CompetencyScores } from "@/lib/adaptive-interview";
import {
  createNewSession,
  computeAverageScore,
  computeEstimatedLevel,
  updateScores,
  getDifficultyLabel,
  getDifficultyColor,
  INITIAL_SCORES,
} from "@/lib/adaptive-interview";
import type { AdaptiveEvaluationResult } from "@/app/api/adaptive-evaluate/route";
import { slugToCareerKey } from "@/lib/scenarios";
import { getCareerByKey } from "@/lib/careers";
import { addXp, getLevelForXp, getStoredXp } from "@/lib/leveling";
import { updateStreak } from "@/lib/streak";
import { addInterviewRecord } from "@/lib/interview-history";

type AdaptiveQuestionResponse = {
  question: string;
  difficulty: number;
  competency: string;
  reasoning: string;
  scoreDelta: Partial<CompetencyScores>;
  interviewerNotes: string;
  followupType: string;
  stage: string;
};

export default function AdaptiveInterviewScreen({
  careerKey,
  companyId,
  companyName,
  scenario,
}: {
  careerKey: string;
  companyId: string;
  companyName: string;
  scenario: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<AdaptiveQuestionResponse | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<AdaptiveEvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const answerRef = useRef<HTMLTextAreaElement>(null);

  const internalKey = slugToCareerKey(careerKey);
  const careerConfig = internalKey ? getCareerByKey(internalKey) : null;
  const careerTitle = careerConfig?.title ?? careerKey.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  useEffect(() => {
    setMounted(true);
    const storedXp = getStoredXp();
    const lvl = getLevelForXp(storedXp).level;
    setXp(storedXp);
    setLevel(lvl);
  }, []);

  // Start the interview
  const startInterview = useCallback(() => {
    const newSession = createNewSession(
      careerKey,
      careerTitle,
      companyId,
      companyName,
      scenario,
      5 // initial difficulty
    );
    setSession(newSession);
    setQuestionCount(0);
    setInterviewComplete(false);
    setShowSummary(false);
    setEvaluation(null);
    setAnswer("");
    setError(null);

    // Generate first question
    generateNextQuestion(newSession, "Let's begin the interview. I'm ready for the first question.");
  }, [careerKey, careerTitle, companyId, companyName, scenario]);

  const generateNextQuestion = async (currentSession: InterviewSession, lastAnswer: string) => {
    setLoading(true);
    setError(null);
    setEvaluation(null);

    try {
      const res = await fetch("/api/adaptive-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session: currentSession,
          lastAnswer,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to generate question");
      }

      const data = await res.json();
      setCurrentQuestion(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      console.error("Question generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim() || evaluating || !session || !currentQuestion) return;

    setEvaluating(true);
    setError(null);

    try {
      // Evaluate the answer
      const evalRes = await fetch("/api/adaptive-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer,
          question: currentQuestion.question,
          careerKey,
          difficulty: currentQuestion.difficulty,
        }),
      });

      if (!evalRes.ok) {
        const data = await evalRes.json();
        throw new Error(data?.error || "Evaluation failed");
      }

      const evalData = await evalRes.json() as AdaptiveEvaluationResult;
      setEvaluation(evalData);

      // Update streak
      updateStreak();

      // Calculate score delta from evaluation
      const scoreDelta: Partial<CompetencyScores> = {
        technical: evalData.technical - (session.competencyScores.technical || 0),
        communication: evalData.communication - (session.competencyScores.communication || 0),
        problemSolving: evalData.problemSolving - (session.competencyScores.problemSolving || 0),
        decisionMaking: evalData.decisionMaking - (session.competencyScores.decisionMaking || 0),
        leadership: evalData.leadership - (session.competencyScores.leadership || 0),
        confidence: evalData.confidence - (session.competencyScores.confidence || 0),
        depthOfKnowledge: evalData.depthOfKnowledge - (session.competencyScores.depthOfKnowledge || 0),
      };

      // Create interview turn
      const turn: InterviewTurn = {
        questionNumber: questionCount + 1,
        question: currentQuestion.question,
        answer,
        difficulty: currentQuestion.difficulty,
        competency: currentQuestion.competency,
        followupType: currentQuestion.followupType as InterviewTurn["followupType"],
        scores: evalData as unknown as CompetencyScores,
        scoreDelta,
        interviewerNotes: currentQuestion.interviewerNotes,
        aiReasoning: currentQuestion.reasoning,
        timestamp: new Date().toISOString(),
      };

      // Update session
      const updatedSession: InterviewSession = {
        ...session,
        difficulty: currentQuestion.difficulty,
        stage: currentQuestion.stage as InterviewSession["stage"],
        competencyScores: updateScores(session.competencyScores, scoreDelta),
        estimatedCandidateLevel: evalData.estimatedLevel || computeEstimatedLevel(updateScores(session.competencyScores, scoreDelta)),
        questionsAsked: [...session.questionsAsked, currentQuestion.question],
        answersGiven: [...session.answersGiven, answer],
        history: [...session.history, turn],
        strengths: [...new Set([...session.strengths, ...evalData.strengths])],
        weaknesses: [...new Set([...session.weaknesses, ...evalData.weaknesses])],
      };

      setSession(updatedSession);
      setQuestionCount((prev) => prev + 1);

      // Award XP for answering
      const xpGained = Math.max(5, Math.round(evalData.estimatedLevel * 3));
      addXp(xpGained);
      const newXp = getStoredXp();
      const newLevel = getLevelForXp(newXp);
      setXp(newXp);
      setLevel(newLevel.level);

      // Check if interview should continue (5-8 questions)
      if (questionCount + 1 >= 6) {
        setInterviewComplete(true);
      } else {
        // Generate next question after a short delay
        setTimeout(() => {
          generateNextQuestion(updatedSession, answer);
          setAnswer("");
          setEvaluation(null);
        }, 1500);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      console.error("Evaluation error:", err);
    } finally {
      setEvaluating(false);
    }
  };

  const completeInterview = () => {
    if (!session) return;

    // Save interview record
    const avgScore = computeAverageScore(session.competencyScores);
    addInterviewRecord({
      scenarioTitle: `${careerTitle} — ${companyName} Interview`,
      category: session.stage,
      difficulty: getDifficultyLabel(session.difficulty),
      careerKey,
      scores: {
        relevance: Math.round(session.competencyScores.technical),
        clarity: Math.round(session.competencyScores.communication),
        reasoning: Math.round(session.competencyScores.problemSolving),
      },
      scorePercentage: Math.round(avgScore * 10),
      passed: avgScore >= 5,
      xpEarned: Math.round(avgScore * 10),
    });

    setSession({ ...session, completed: true });
    setShowSummary(true);
  };

  const handleNewInterview = () => {
    startInterview();
  };

  // Score bar component
  function ScoreBar({ label, score, maxScore = 10, color }: { label: string; score: number; maxScore?: number; color: string }) {
    const pct = Math.min(100, (score / maxScore) * 100);
    return (
      <div className="group">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-semibold ${color}`}>{label}</span>
          <span className={`text-xs font-bold ${color}`}>{score}/{maxScore}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className={`h-full rounded-full ${color.replace("text-", "bg-")} transition-all duration-700 ease-out`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
      </div>
    );
  }

  // Show summary screen
  if (showSummary && session) {
    const avgScore = computeAverageScore(session.competencyScores);
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-12">
          <div className="text-center mb-8">
            <span className="text-5xl mb-4 block">🎯</span>
            <p className="inline-flex rounded-full bg-sky-500/15 px-4 py-1 text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">
              Interview Complete
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              {companyName} Interview Summary
            </h1>
          </div>

          {/* Overall Score */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center rounded-3xl border border-white/10 bg-zinc-900/70 px-8 py-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-400 mb-1">Overall Score</p>
                <p className="text-5xl font-bold text-sky-400">{avgScore.toFixed(1)}/10</p>
                <p className="text-sm text-zinc-400 mt-1">
                  Estimated Level: {session.estimatedCandidateLevel}/10
                </p>
              </div>
            </div>
          </div>

          {/* Competency Scores */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
              <p className="text-xs uppercase tracking-wider text-zinc-400 mb-4">Competency Scores</p>
              <div className="space-y-3">
                <ScoreBar label="Technical" score={session.competencyScores.technical} color="text-sky-400" />
                <ScoreBar label="Communication" score={session.competencyScores.communication} color="text-violet-400" />
                <ScoreBar label="Problem Solving" score={session.competencyScores.problemSolving} color="text-emerald-400" />
                <ScoreBar label="Decision Making" score={session.competencyScores.decisionMaking} color="text-amber-400" />
                <ScoreBar label="Leadership" score={session.competencyScores.leadership} color="text-rose-400" />
                <ScoreBar label="Confidence" score={session.competencyScores.confidence} color="text-cyan-400" />
                <ScoreBar label="Depth of Knowledge" score={session.competencyScores.depthOfKnowledge} color="text-indigo-400" />
              </div>
            </div>

            <div className="space-y-4">
              {/* Strengths */}
              {session.strengths.length > 0 && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <p className="text-xs uppercase tracking-wider text-emerald-400 mb-3">Strengths</p>
                  <ul className="space-y-2">
                    {session.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-emerald-200">
                        <span className="mt-0.5 text-emerald-400">✦</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {session.weaknesses.length > 0 && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                  <p className="text-xs uppercase tracking-wider text-amber-400 mb-3">Areas to Improve</p>
                  <ul className="space-y-2">
                    {session.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-200">
                        <span className="mt-0.5 text-amber-400">▲</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Stats */}
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
                <p className="text-xs uppercase tracking-wider text-zinc-400 mb-3">Interview Stats</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-2xl font-bold text-white">{session.history.length}</p>
                    <p className="text-xs text-zinc-500">Questions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-sky-400">{xp}</p>
                    <p className="text-xs text-zinc-500">Total XP</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-400">{level}</p>
                    <p className="text-xs text-zinc-500">Level</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-violet-400">{getDifficultyLabel(session.difficulty)}</p>
                    <p className="text-xs text-zinc-500">Peak Difficulty</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interview History */}
          <div className="mb-8 rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
            <p className="text-xs uppercase tracking-wider text-zinc-400 mb-4">Interview Transcript</p>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {session.history.map((turn) => (
                <div key={turn.questionNumber} className="rounded-xl border border-white/5 bg-zinc-950/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-[10px] font-bold text-sky-400">
                      Q{turn.questionNumber}
                    </span>
                    <span className={`text-[10px] font-medium ${getDifficultyColor(turn.difficulty)}`}>
                      {getDifficultyLabel(turn.difficulty)}
                    </span>
                    <span className="text-[10px] text-zinc-500">{turn.competency}</span>
                    <span className="text-[10px] text-zinc-600">{turn.followupType}</span>
                  </div>
                  <p className="text-sm text-zinc-300 mb-2">{turn.question}</p>
                  <p className="text-sm text-zinc-400 italic">{turn.answer.substring(0, 200)}{turn.answer.length > 200 ? "..." : ""}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleNewInterview}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-sky-500 px-8 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400"
            >
              Start New Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show start screen
  if (!session) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-12">
          <div className="text-center space-y-6">
            <span className="text-6xl block">🎙️</span>
            <p className="inline-flex rounded-full bg-sky-500/15 px-4 py-1 text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">
              Adaptive Interview
            </p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">
              {companyName} Interview
            </h1>
            <p className="text-base leading-7 text-zinc-300 max-w-2xl mx-auto">
              This is a fully adaptive AI interview. Every answer you give will influence the next question, difficulty, and scoring.
              The interviewer will challenge your assumptions, ask for details, and adapt to your skill level in real-time.
            </p>
            <div className="grid gap-4 sm:grid-cols-3 max-w-lg mx-auto">
              <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
                <p className="text-2xl mb-1">🧠</p>
                <p className="text-xs text-zinc-400">Adaptive Questions</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
                <p className="text-2xl mb-1">📊</p>
                <p className="text-xs text-zinc-400">Live Scoring</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
                <p className="text-2xl mb-1">🎯</p>
                <p className="text-xs text-zinc-400">Personalized Path</p>
              </div>
            </div>
            <button
              onClick={startInterview}
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-10 py-4 text-lg font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400"
            >
              Start Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main interview UI
  const diffColor = currentQuestion ? getDifficultyColor(currentQuestion.difficulty) : "text-zinc-400";

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-12">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex rounded-full bg-sky-500/15 px-4 py-1 text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">
                {companyName} Interview
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                {careerTitle}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs uppercase tracking-wider text-zinc-400">Question</p>
                <p className="text-xl font-bold text-white">{questionCount + 1}/6</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-xs uppercase tracking-wider text-zinc-400">Difficulty</p>
                <p className={`text-xl font-bold ${diffColor}`}>
                  {currentQuestion ? getDifficultyLabel(currentQuestion.difficulty) : "—"}
                </p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-xs uppercase tracking-wider text-zinc-400">Level</p>
                <p className="text-xl font-bold text-white">{level}</p>
              </div>
            </div>
          </div>

          {/* Live Scores */}
          {session && (
            <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-3">Live Competency Scores</p>
              <div className="grid grid-cols-4 gap-x-4 gap-y-2 sm:grid-cols-7">
                <div className="text-center">
                  <p className="text-lg font-bold text-sky-400">{session.competencyScores.technical}</p>
                  <p className="text-[9px] text-zinc-500">Tech</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-violet-400">{session.competencyScores.communication}</p>
                  <p className="text-[9px] text-zinc-500">Comm</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-emerald-400">{session.competencyScores.problemSolving}</p>
                  <p className="text-[9px] text-zinc-500">Prob</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-amber-400">{session.competencyScores.decisionMaking}</p>
                  <p className="text-[9px] text-zinc-500">Dec</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-rose-400">{session.competencyScores.leadership}</p>
                  <p className="text-[9px] text-zinc-500">Lead</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-cyan-400">{session.competencyScores.confidence}</p>
                  <p className="text-[9px] text-zinc-500">Conf</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-indigo-400">{session.competencyScores.depthOfKnowledge}</p>
                  <p className="text-[9px] text-zinc-500">Depth</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex min-h-[30vh] items-center justify-center">
              <div className="text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-400 border-t-transparent mx-auto mb-4" />
                <p className="text-sm text-zinc-400">Generating next question...</p>
              </div>
            </div>
          )}

          {/* Current Question */}
          {currentQuestion && !loading && (
            <div className="rounded-3xl border border-sky-500/20 bg-sky-500/5 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/20 text-xs text-sky-400">
                  Q
                </span>
                <span className={`text-xs font-medium ${diffColor}`}>
                  {currentQuestion.competency} · {getDifficultyLabel(currentQuestion.difficulty)}
                </span>
                <span className="text-xs text-zinc-500">· {currentQuestion.followupType}</span>
              </div>
              <p className="text-lg leading-8 text-white">
                {currentQuestion.question}
              </p>
              {currentQuestion.reasoning && (
                <p className="mt-2 text-xs text-zinc-500 italic">
                  Why this question: {currentQuestion.reasoning}
                </p>
              )}
            </div>
          )}

          {/* Evaluation Result */}
          {evaluation && (
            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-emerald-400">📊</span>
                <p className="text-sm font-medium text-emerald-300">Live Evaluation</p>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-3 sm:grid-cols-7">
                <div className="text-center">
                  <p className="text-sm font-bold text-sky-400">{evaluation.technical}</p>
                  <p className="text-[9px] text-zinc-500">Tech</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-violet-400">{evaluation.communication}</p>
                  <p className="text-[9px] text-zinc-500">Comm</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-emerald-400">{evaluation.problemSolving}</p>
                  <p className="text-[9px] text-zinc-500">Prob</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-amber-400">{evaluation.decisionMaking}</p>
                  <p className="text-[9px] text-zinc-500">Dec</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-rose-400">{evaluation.leadership}</p>
                  <p className="text-[9px] text-zinc-500">Lead</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-cyan-400">{evaluation.confidence}</p>
                  <p className="text-[9px] text-zinc-500">Conf</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-indigo-400">{evaluation.depthOfKnowledge}</p>
                  <p className="text-[9px] text-zinc-500">Depth</p>
                </div>
              </div>
              <p className="text-sm text-zinc-300">{evaluation.feedback}</p>
              {evaluation.strengths.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {evaluation.strengths.map((s, i) => (
                    <span key={i} className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Answer Input */}
          <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6">
            <h2 className="text-lg font-semibold text-white mb-3">
              Your Answer
            </h2>
            <textarea
              ref={answerRef}
              className="w-full rounded-xl border border-white/10 bg-zinc-950/80 p-4 text-base leading-7 text-zinc-200 placeholder-zinc-500 focus:border-sky-400/50 focus:outline-none focus:ring-1 focus:ring-sky-400/50"
              rows={6}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here. Be specific, provide examples, and explain your reasoning..."
              disabled={loading || evaluating || interviewComplete}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {!interviewComplete ? (
              <button
                className="inline-flex flex-1 items-center justify-center rounded-full bg-sky-500 px-8 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={submitAnswer}
                disabled={loading || evaluating || !answer.trim() || !currentQuestion}
              >
                {evaluating ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    Evaluating...
                  </span>
                ) : loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    Generating...
                  </span>
                ) : (
                  "Submit Answer"
                )}
              </button>
            ) : (
              <button
                className="inline-flex flex-1 items-center justify-center rounded-full bg-emerald-500 px-8 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
                onClick={completeInterview}
              >
                View Interview Summary
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}