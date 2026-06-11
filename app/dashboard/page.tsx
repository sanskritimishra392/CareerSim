"use client";

import { useEffect, useMemo, useState } from "react";
import { getLevelForXp, getStoredXp, XP_PER_LEVEL } from "@/lib/leveling";
import StreakDisplay from "@/app/components/StreakDisplay";
import CareerProgressionRoadmap from "@/app/components/CareerProgressionRoadmap";
import { getReputationRank, getReputationProgress } from "@/lib/ranks";
import CompanyReadinessPanel from "@/app/components/CompanyReadinessPanel";
import { updateStreak } from "@/lib/streak";

interface SimulationRecord {
  career?: string;
  scenario?: string;
  scenarioTitle?: string;
  scenarioPrompt?: string;
  response: string;
  feedback: string;
  scores: {
    technicalSkill: number;
    communication: number;
    decisionMaking: number;
  };
  submittedAt: string;
}

const STORAGE_KEY = "careerSimHistory";

export default function DashboardPage() {
  const [history] = useState<SimulationRecord[]>(() => {
    if (typeof window === "undefined") return [];

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    try {
      return JSON.parse(raw) as SimulationRecord[];
    } catch {
      return [];
    }
  });
  const [xp] = useState<number>(() =>
    typeof window === "undefined" ? 0 : getStoredXp()
  );

  const levelData = getLevelForXp(xp);
  const rank = useMemo(() => typeof window !== "undefined" ? getReputationRank() : null, []);
  const repProgress = useMemo(() => typeof window !== "undefined" ? getReputationProgress() : null, []);
  const averageScore = useMemo(() => {
    if (!history.length) return 0;

    const totals = history.reduce(
      (acc, record) => {
        acc += record.scores.technicalSkill + record.scores.communication + record.scores.decisionMaking;
        return acc;
      },
      0
    );

    return Math.round((totals / (history.length * 3)) * 100) / 100;
  }, [history]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10 sm:px-8 lg:px-12">
        <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-12">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="inline-flex rounded-full bg-sky-500/15 px-4 py-1 text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">
                Simulation Dashboard
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                CareerSim Performance Overview
              </h1>
              <p className="max-w-3xl text-base leading-8 text-zinc-300 sm:text-lg">
                Track your level, XP progress, completed simulations, and revisit recent responses and feedback.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6 shadow-xl shadow-black/20 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">Current Level</p>
                <p className="mt-4 text-5xl font-semibold text-white">{levelData.level}</p>
                <p className="mt-2 text-sm text-zinc-400">{xp} total XP</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6 shadow-xl shadow-black/20 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">XP Total</p>
                <p className="mt-4 text-5xl font-semibold text-white">{xp}</p>
                <p className="mt-2 text-sm text-zinc-400">{levelData.xpToNext} XP to Level {levelData.level + 1}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6 shadow-xl shadow-black/20 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">Average Score</p>
                <p className="mt-4 text-5xl font-semibold text-white">{averageScore}%</p>
                <p className="mt-2 text-sm text-zinc-400">{history.length} simulations completed</p>
              </div>
              {rank && (
                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/70 to-zinc-900/30 p-6 shadow-xl shadow-black/20 backdrop-blur">
                  <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">Reputation Rank</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-4xl">{rank.icon}</span>
                    <div>
                      <p className={`text-2xl font-bold ${rank.color}`}>{rank.name}</p>
                      {repProgress && (
                        <p className="text-[10px] text-zinc-500">Tier {repProgress.current} · {repProgress.score} pts</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6 shadow-xl shadow-black/20 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">Progress to Level {levelData.level + 1}</p>
                  <p className="mt-2 text-sm text-zinc-300">
                    {Math.round(levelData.progress * 100)}% complete · {XP_PER_LEVEL} XP per level
                  </p>
                </div>
                <p className="text-sm font-semibold text-white">
                  {levelData.xpInCurrentLevel}/{XP_PER_LEVEL} XP
                </p>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all"
                  style={{ width: `${Math.round(levelData.progress * 100)}%` }}
                />
              </div>
            </div>

            {/* Career Progression Roadmap */}
            <CareerProgressionRoadmap />

            {/* Streak Display */}
            <StreakDisplay variant="full" />

            {/* Company Readiness */}
            <CompanyReadinessPanel careerKey="software-engineer" />

            <div className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6 shadow-xl shadow-black/20 backdrop-blur">
                <h2 className="text-2xl font-semibold text-white">Recent Simulation History</h2>
                {history.length ? (
                  <div className="mt-6 space-y-4">
                    {history.slice(0, 5).map((record) => {
                      const title = record.scenarioTitle || record.scenario || "Simulation";
                      const prompt = record.scenarioPrompt || record.scenario || "";

                      return (
                        <div key={record.submittedAt} className="rounded-3xl border border-white/10 bg-zinc-950/90 p-5">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm uppercase tracking-[0.24em] text-sky-300">{new Date(record.submittedAt).toLocaleString()}</p>
                            <div className="rounded-full bg-slate-900/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                              {title}
                            </div>
                          </div>
                          <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <div className="rounded-3xl bg-zinc-900/80 p-4 text-sm text-zinc-300">
                              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Technical Skill</p>
                              <p className="mt-2 text-xl font-semibold text-white">{record.scores.technicalSkill}/10</p>
                            </div>
                            <div className="rounded-3xl bg-zinc-900/80 p-4 text-sm text-zinc-300">
                              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Communication</p>
                              <p className="mt-2 text-xl font-semibold text-white">{record.scores.communication}/10</p>
                            </div>
                            <div className="rounded-3xl bg-zinc-900/80 p-4 text-sm text-zinc-300">
                              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Decision Making</p>
                              <p className="mt-2 text-xl font-semibold text-white">{record.scores.decisionMaking}/10</p>
                            </div>
                          </div>
                          {prompt ? (
                            <div className="mt-4 rounded-3xl bg-zinc-900/80 p-4 text-sm leading-6 text-zinc-300">
                              <p className="font-medium text-white">Scenario</p>
                              <p className="mt-2 whitespace-pre-wrap">{prompt}</p>
                            </div>
                          ) : null}
                          <div className="mt-4 rounded-3xl bg-zinc-900/80 p-4 text-sm leading-6 text-zinc-300">
                            <p className="font-medium text-white">Response</p>
                            <p className="mt-2 whitespace-pre-wrap">{record.response}</p>
                          </div>
                          <div className="mt-4 rounded-3xl bg-zinc-900/80 p-4 text-sm leading-6 text-zinc-300">
                            <p className="font-medium text-white">Feedback</p>
                            <pre className="mt-2 whitespace-pre-wrap text-sm text-zinc-200">{record.feedback}</pre>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-6 text-sm leading-7 text-zinc-400">No simulation history found yet. Complete a scenario from any career simulation to start tracking your progress.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}