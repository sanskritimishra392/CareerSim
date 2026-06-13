"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ACHIEVEMENTS,
  CATEGORY_LABELS,
  buildStats,
  getEarnedIds,
} from "@/lib/achievements";
import { getStreakData } from "@/lib/streak";
import { getLevelForXp, getStoredXp } from "@/lib/leveling";

export default function BadgeGallery() {
  const [earnedIds, setEarnedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const xp = getStoredXp();
    const level = getLevelForXp(xp).level;
    const streakData = getStreakData();

    // Build achievement stats from localStorage
    const raw = localStorage.getItem("careerSimHistory");
    let history: { career?: string; scores?: { technicalSkill: number; communication: number; decisionMaking: number }; difficulty?: string }[] = [];
    try { if (raw) history = JSON.parse(raw); } catch {}

    const scenariosByCategory: Record<string, number> = {};
    let totalScore = 0;
    let scoreCount = 0;
    let maxScore = 0;
    let hardCount = 0;

    for (const record of history) {
      const career = record.career || "unknown";
      scenariosByCategory[career] = (scenariosByCategory[career] || 0) + 1;

      if (record.scores) {
        const avg = (record.scores.technicalSkill + record.scores.communication + record.scores.decisionMaking) / 3;
        totalScore += avg;
        scoreCount++;
        if (avg > maxScore) maxScore = avg;
      }

      if (record.difficulty === "hard") hardCount++;
    }

    const averageScore = scoreCount > 0 ? Math.round((totalScore / scoreCount) * 10) / 10 : 0;

    const stats = buildStats(
      history.length,
      averageScore,
      maxScore,
      streakData.currentStreak,
      xp,
      level,
      hardCount,
      scenariosByCategory
    );

    const earned = getEarnedIds(stats);
    setEarnedIds(earned.map((a) => a.id));
  }, []);

  // Categories for filter tabs
  const categories = useMemo(() => {
    const cats = new Set(ACHIEVEMENTS.map((a) => a.category));
    return Array.from(cats);
  }, []);

  // Filtered achievements
  const filtered = useMemo(() => {
    if (!filter) return ACHIEVEMENTS;
    return ACHIEVEMENTS.filter((a) => a.category === filter);
  }, [filter]);

  const earnedCount = earnedIds.length;

  if (!mounted) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="inline-flex rounded-full bg-sky-500/15 px-4 py-1 text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">
          Achievements
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Badge Collection
        </h1>
        <p className="mt-2 text-base text-zinc-400">
          You've earned <span className="font-bold text-white">{earnedCount}</span> of{" "}
                      <span className="font-bold text-white">{ACHIEVEMENTS.length}</span> achievements
        </p>
      </div>

      {/* Progress overview */}
      <div className="mb-8 rounded-2xl border border-white/10 bg-zinc-900/70 p-6">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
          <span>Overall Progress</span>
          <span>{earnedCount} / {ACHIEVEMENTS.length}</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 via-violet-500 to-amber-500 transition-all duration-700"
            style={{ width: `${(earnedCount / ACHIEVEMENTS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter(null)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            !filter
              ? "bg-sky-500/20 text-sky-300 border border-sky-400/30"
              : "bg-zinc-800/50 text-zinc-400 border border-zinc-700 hover:border-zinc-600"
          }`}
        >
          All
        </button>
        {categories.map((cat) => {
          const label = CATEGORY_LABELS[cat];
          return (
            <button
              key={cat}
              onClick={() => setFilter(filter === cat ? null : cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                filter === cat
                  ? "bg-sky-500/20 text-sky-300 border border-sky-400/30"
                  : "bg-zinc-800/50 text-zinc-400 border border-zinc-700 hover:border-zinc-600"
              }`}
            >
              {label?.icon} {label?.label}
            </button>
          );
        })}
      </div>

      {/* Badge grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((achievement) => {
          const earned = earnedIds.includes(achievement.id);

          return (
            <div
              key={achievement.id}
              className={`rounded-2xl border p-5 transition group ${
                earned
                  ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-400/50"
                  : "border-zinc-800 bg-zinc-900/30 opacity-60 hover:opacity-80"
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl transition ${
                    earned
                      ? "bg-emerald-500/20 group-hover:scale-110"
                      : "bg-zinc-800 grayscale"
                  }`}
                >
                  {achievement.icon}
                </div>
                <p className={`mt-3 text-sm font-semibold ${earned ? "text-white" : "text-zinc-600"}`}>
                  {achievement.name}
                </p>
                <p className={`mt-1 text-xs leading-tight ${earned ? "text-zinc-400" : "text-zinc-700"}`}>
                  {achievement.description}
                </p>
                {earned && (
                  <span className="mt-2 inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                    ✓ Earned
                  </span>
                )}
                {!earned && (
                  <span className="mt-2 inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                    Locked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}