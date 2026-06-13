"use client";

import { useState, useEffect } from "react";
import {
  getStreakForDisplay,
  getStreakStatus,
  getNextMilestone,
  getEarnedStreakBadges,
  getStreakMilestoneProgress,
  STREAK_BADGES,
  type StreakData,
} from "@/lib/streak";

type DisplayVariant = "full" | "compact" | "minimal";

interface StreakDisplayProps {
  variant?: DisplayVariant;
}

export default function StreakDisplay({
  variant = "full",
}: StreakDisplayProps) {
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, lastActiveDate: "" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const data = getStreakForDisplay();
    setStreak(data);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <span className="h-5 w-5 animate-pulse rounded bg-zinc-800" />
        <span className="h-4 w-16 animate-pulse rounded bg-zinc-800" />
      </div>
    );
  }

  const status = getStreakStatus(streak.currentStreak);
  const nextMilestone = getNextMilestone(streak.currentStreak);
  const earnedBadges = getEarnedStreakBadges(streak.longestStreak);
  const milestones = getStreakMilestoneProgress(streak.longestStreak);

  if (variant === "minimal") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg">🔥</span>
        <span className="text-lg font-bold text-white">{streak.currentStreak}</span>
        <span className="text-xs text-zinc-500">day{streak.currentStreak !== 1 ? "s" : ""}</span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/70 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">🔥</span>
          <span className="text-lg font-bold text-white">{streak.currentStreak}</span>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div className="flex flex-col">
          <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
          {nextMilestone && streak.currentStreak > 0 && (
            <span className="text-[10px] text-zinc-500">
              {nextMilestone.days - streak.currentStreak} days to {nextMilestone.name}
            </span>
          )}
        </div>
        {streak.currentStreak === 0 && (
          <span className="text-xs text-zinc-500">Complete a simulation to start</span>
        )}
      </div>
    );
  }

  // Full variant
  const hasStreak = streak.currentStreak > 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs uppercase tracking-wider text-zinc-400">Streak</p>
        <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
      </div>

      {/* Current streak display */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="flex flex-col items-center">
          <span className="text-4xl">🔥</span>
          <span className="mt-1 text-4xl font-bold text-orange-400">{streak.currentStreak}</span>
          <span className="text-xs text-zinc-500">current</span>
        </div>
        <div className="h-16 w-px bg-white/10" />
        <div className="flex flex-col items-center">
          <span className="text-4xl">🏆</span>
          <span className="mt-1 text-4xl font-bold text-amber-400">{streak.longestStreak}</span>
          <span className="text-xs text-zinc-500">longest</span>
        </div>
      </div>

      {/* Next milestone progress */}
      {hasStreak && nextMilestone && (
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
            <span>Next milestone: {nextMilestone.icon} {nextMilestone.name}</span>
            <span>{streak.currentStreak} / {nextMilestone.days} days</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-700"
              style={{ width: `${Math.min(100, (streak.currentStreak / nextMilestone.days) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* No streak state */}
      {!hasStreak && (
        <div className="mb-5 rounded-xl bg-zinc-950/50 p-4 text-center">
          <p className="text-sm text-zinc-400">Complete a simulation today to start your streak!</p>
        </div>
      )}

      {/* Milestone badges */}
      {earnedBadges.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
            Streak Badges ({earnedBadges.length}/{STREAK_BADGES.length})
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {milestones.map((m) => {
              const isEarned = m.reached;
              return (
                <div
                  key={m.days}
                  className={`rounded-xl border p-3 text-center transition ${
                    isEarned
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-zinc-800 bg-zinc-900/50 opacity-50"
                  }`}
                >
                  <span className={`text-xl ${isEarned ? "" : "grayscale"}`}>{m.icon}</span>
                  <p className={`mt-1 text-[10px] font-medium ${isEarned ? "text-white" : "text-zinc-600"}`}>
                    {m.days}d
                  </p>
                  {!isEarned && m.daysRemaining > 0 && (
                    <p className="text-[9px] text-zinc-700">{m.daysRemaining} left</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No badges yet */}
      {earnedBadges.length === 0 && (
        <p className="text-xs text-zinc-500 text-center py-2">
          Complete {nextMilestone ? nextMilestone.days : 1} consecutive days to earn your first badge
        </p>
      )}
    </div>
  );
}