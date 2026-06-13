"use client";

import { useEffect, useState, useCallback } from "react";
import ScenarioCard from "@/app/components/ScenarioCard";
import CompanyUnlockPanel from "@/app/components/CompanyUnlockPanel";

import type { ActiveScenario } from "@/lib/scenario-types";
import { PHASE_LABELS } from "@/lib/scenario-types";

import type { EvaluationResult } from "@/lib/evaluator";

import {
  addXp,
  getLevelForXp,
  getStoredXp,
} from "@/lib/leveling";

import { slugToCareerKey } from "@/lib/scenarios";
import { getCareerByKey } from "@/lib/careers";
import { updateStreak } from "@/lib/streak";
import DiscussionSection from "@/app/components/DiscussionSection";
import CompanyReadinessPanel from "@/app/components/CompanyReadinessPanel";
import AIMentorCard from "@/app/components/AIMentorCard";
import { addInterviewRecord } from "@/lib/interview-history";

export default function ScenarioScreen({
  careerKey,
}: {
  careerKey: string;
}) {
  const [mounted, setMounted] = useState(false);

  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  const [scenario, setScenario] = useState<ActiveScenario | null>(null);
  const [loadingScenario, setLoadingScenario] = useState(true);
  const [scenarioError, setScenarioError] = useState<string | null>(null);

  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [followUp, setFollowUp] = useState<{ question: string; context: string } | null>(null);
  const [roundHistory, setRoundHistory] = useState<{ round: number; answer: string; result: EvaluationResult }[]>([]);

  // Derive the internal career key from the slug
  const internalKey = slugToCareerKey(careerKey);
  const careerConfig = internalKey ? getCareerByKey(internalKey) : null;
  const careerTitle = careerConfig?.title ?? careerKey.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // Load XP and level on mount
  useEffect(() => {
    setMounted(true);
    const storedXp = getStoredXp();
    const lvl = getLevelForXp(storedXp).level;
    setXp(storedXp);
    setLevel(lvl);
  }, []);

  // Generate a new scenario
  const generateNewScenario = useCallback(async () => {
    setLoadingScenario(true);
    setScenarioError(null);
    setScenario(null);
    setResult(null);
    setError(null);
    setAnswer("");
    setFollowUp(null);
    setRoundHistory([]);

    const storedXp = getStoredXp();
    const lvl = getLevelForXp(storedXp).level;
    setXp(storedXp);
    setLevel(lvl);

    try {
      const res = await fetch("/api/generate-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careerKey, level: lvl }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to generate scenario");
      }

      const data = await res.json();
      setScenario(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setScenarioError(message);
      console.error("Scenario generation error:", err);
    } finally {
      setLoadingScenario(false);
    }
  }, [careerKey]);

  // Initial scenario generation when mounted
  useEffect(() => {
    if (mounted) {
      generateNewScenario();
    }
  }, [mounted, generateNewScenario]);

  const submit = async () => {
    if (!answer.trim() || loading || !scenario) return;

    setLoading(true);
    setError(null);

    const currentRound = scenario.currentRound;
    const currentRoundData = scenario.rounds[currentRound - 1];

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answer,
          scenario: currentRoundData?.problem || "",
          careerKey,
          category: scenario.category,
          difficulty: scenario.difficulty,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Evaluation failed");
      }

      // Update streak on activity
      updateStreak();

      setResult(data);

      // Add to round history
      setRoundHistory((prev) => [
        ...prev,
        { round: currentRound, answer, result: data },
      ]);

      // Check if there are more rounds
      const nextRoundNum = currentRound + 1;
      if (nextRoundNum <= scenario.totalRounds) {
        // Try to generate an intelligent follow-up
        try {
          const fuRes = await fetch("/api/generate-followup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              scenario,
              userAnswer: answer,
              roundNumber: currentRound,
            }),
          });
          if (fuRes.ok) {
            const fuData = await fuRes.json();
            setFollowUp(fuData);
          }
        } catch {
          // Fallback: just advance to next round without follow-up
          setFollowUp({
            question: `The situation has evolved. Proceed to Round ${nextRoundNum}.`,
            context: scenario.rounds[nextRoundNum - 1]?.context || "New developments have emerged.",
          });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      setError(message);
      console.error("Evaluation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const advanceRound = () => {
    if (!scenario) return;

    setScenario({
      ...scenario,
      currentRound: scenario.currentRound + 1,
    });
    setAnswer("");
    setResult(null);
    setFollowUp(null);
    setError(null);

    // Award partial XP when advancing rounds
    const partialXp = Math.floor(scenario.xpReward / scenario.totalRounds);
    addXp(partialXp);

    const newXp = getStoredXp();
    const newLevel = getLevelForXp(newXp);
    setXp(newXp);
    setLevel(newLevel.level);
  };

  const completeScenario = () => {
    // Award remaining XP for completing the final round
    if (scenario) {
      addXp(scenario.xpReward);

      // Save interview history record
      if (result) {
        addInterviewRecord({
          scenarioTitle: `${careerTitle} — ${scenario.category}`,
          category: scenario.category,
          difficulty: scenario.difficulty,
          careerKey,
          scores: {
            relevance: result.breakdown?.relevance || 5,
            clarity: result.breakdown?.clarity || 5,
            reasoning: result.breakdown?.reasoning || 5,
          },
          scorePercentage: result.scorePercentage,
          passed: result.passed,
          xpEarned: result.xpEarned,
        });
      }

      const newXp = getStoredXp();
      const newLevel = getLevelForXp(newXp);
      setXp(newXp);
      setLevel(newLevel.level);
    }

    // Show final summary instead of immediately generating new scenario
    setFollowUp(null);
  };

  const handleNewScenario = () => {
    generateNewScenario();
  };

  // ─── Render ──────────────────────────────────────────────────────

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
      </div>
    );
  }

  if (!careerKey) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-12">
          <div className="flex min-h-[20vh] items-center justify-center">
            <p className="text-zinc-400">Career not specified. Please navigate from the careers page.</p>
          </div>
        </div>
      </div>
    );
  }

  const progress = getLevelForXp(xp);
  const isLastRound = scenario && scenario.currentRound >= scenario.totalRounds;
  const hasResult = result !== null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex rounded-full bg-sky-500/15 px-4 py-1 text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">
                Simulation
              </p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
                {careerTitle}
              </h1>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900/70 px-5 py-3">
              <div className="text-center">
                <p className="text-xs uppercase tracking-wider text-zinc-400">Level</p>
                <p className="text-xl font-bold text-white">{level}</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-xs uppercase tracking-wider text-zinc-400">XP</p>
                <p className="text-xl font-bold text-sky-400">{xp}</p>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="w-full">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
              <span>Level {progress.currentLevelXp / 100 + 1}</span>
              <span>{progress.xpInCurrentLevel} / 100 XP</span>
              <span>Level {progress.level}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500 transition-all duration-500"
                style={{ width: `${Math.min(100, progress.progress * 100)}%` }}
              />
            </div>
          </div>

          {/* Loading state */}
          {loadingScenario && (
            <div className="flex min-h-[40vh] items-center justify-center">
              <div className="text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-400 border-t-transparent mx-auto mb-4" />
                <p className="text-sm text-zinc-400">Generating realistic scenario...</p>
              </div>
            </div>
          )}

          {/* Scenario Error */}
          {scenarioError && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
              <p className="text-red-300 mb-4">{scenarioError}</p>
              <button
                onClick={handleNewScenario}
                className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-400"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Scenario Card */}
          {scenario && !loadingScenario && (
            <ScenarioCard scenario={scenario} />
          )}

          {/* Follow-up Question */}
          {followUp && scenario && (
            <div className="rounded-3xl border border-violet-500/20 bg-violet-500/5 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-xs text-violet-400">
                  ⟳
                </span>
                <p className="text-sm font-medium text-violet-300">Follow-up — {PHASE_LABELS[scenario.rounds[scenario.currentRound - 1]?.phase || "initial"]}</p>
              </div>
              <p className="text-base leading-7 text-violet-100 mb-2">
                {followUp.question}
              </p>
              <p className="text-sm text-zinc-400">
                {followUp.context}
              </p>
            </div>
          )}

          {/* Answer */}
          <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6">
            <h2 className="text-lg font-semibold text-white mb-3">
              Your Response
            </h2>
            <textarea
              className="w-full rounded-xl border border-white/10 bg-zinc-950/80 p-4 text-base leading-7 text-zinc-200 placeholder-zinc-500 focus:border-sky-400/50 focus:outline-none focus:ring-1 focus:ring-sky-400/50"
              rows={6}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={`Write your response to Round ${scenario?.currentRound || 1}...`}
              disabled={loading || loadingScenario || hasResult}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {!hasResult ? (
              <button
                className="inline-flex flex-1 items-center justify-center rounded-full bg-sky-500 px-8 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={submit}
                disabled={loading || !answer.trim() || !scenario || loadingScenario}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    Evaluating...
                  </span>
                ) : (
                  "Submit Response"
                )}
              </button>
            ) : (
              <>
                {!isLastRound ? (
                  <button
                    className="inline-flex flex-1 items-center justify-center rounded-full bg-emerald-500 px-8 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
                    onClick={advanceRound}
                  >
                    Next Round →
                  </button>
                ) : (
                  <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                    <button
                      className="inline-flex flex-1 items-center justify-center rounded-full bg-emerald-500 px-8 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
                      onClick={completeScenario}
                    >
                      Complete & Earn XP
                    </button>
                    <button
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-white/10 bg-zinc-800 px-8 py-4 text-base font-semibold text-zinc-300 transition hover:bg-zinc-700"
                      onClick={handleNewScenario}
                    >
                      New Scenario
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* AI Mentor */}
          {result && scenario && (
            <AIMentorCard
              answer={answer}
              scenario={scenario.rounds[scenario.currentRound - 1]?.problem || ""}
              careerKey={careerKey}
              category={scenario.category}
              difficulty={scenario.difficulty}
            />
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6 rounded-3xl border border-sky-400/20 bg-sky-500/5 p-6">
              <h2 className="text-lg font-semibold text-white">
                Round {scenario?.currentRound} Evaluation
              </h2>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-zinc-900/80 p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-zinc-400">Relevance</p>
                  <p className="mt-1 text-3xl font-bold text-sky-400">{result.breakdown.relevance}/10</p>
                </div>
                <div className="rounded-2xl bg-zinc-900/80 p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-zinc-400">Clarity</p>
                  <p className="mt-1 text-3xl font-bold text-violet-400">{result.breakdown.clarity}/10</p>
                </div>
                <div className="rounded-2xl bg-zinc-900/80 p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-zinc-400">Reasoning</p>
                  <p className="mt-1 text-3xl font-bold text-emerald-400">{result.breakdown.reasoning}/10</p>
                </div>
              </div>

              <div className="rounded-2xl bg-zinc-900/80 p-4">
                <p className="text-xs uppercase tracking-wider text-zinc-400 mb-2">Feedback</p>
                <pre className="whitespace-pre-wrap text-sm leading-7 text-zinc-200 font-sans">
                  {result.feedback}
                </pre>
              </div>

              {/* Round History Summary */}
              {roundHistory.length > 0 && isLastRound && (
                <div className="rounded-2xl bg-zinc-900/80 p-4">
                  <p className="text-xs uppercase tracking-wider text-zinc-400 mb-3">Scenario Summary</p>
                  <div className="space-y-2">
                    {roundHistory.map((rh) => (
                      <div key={rh.round} className="flex items-center gap-3 text-sm text-zinc-300">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/20 text-xs font-bold text-sky-400">
                          {rh.round}
                        </span>
                        <span>Round {rh.round}: Avg Score {(rh.result.breakdown.relevance + rh.result.breakdown.clarity + rh.result.breakdown.reasoning) / 3}/10</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Company Unlock Panel */}
          <CompanyUnlockPanel careerKey={careerKey} level={level} />

          {/* Company Readiness */}
          <CompanyReadinessPanel careerKey={careerKey} />

          {/* Discussion Section */}
          {scenario && !loadingScenario && (
            <DiscussionSection scenarioId={scenario.id} />
          )}
        </div>
      </div>
    </div>
  );
}