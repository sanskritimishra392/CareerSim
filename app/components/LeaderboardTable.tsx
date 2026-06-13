"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getLeaderboard,
  LEADERBOARD_CATEGORIES,
  getRealDisplayName,
  type LeaderboardEntry,
} from "@/lib/leaderboard";
import { REPUTATION_RANKS } from "@/lib/ranks";
import { ReputationRank } from "@/lib/ranks";

function getRepRankForLevel(level: number): ReputationRank {
  let rank = REPUTATION_RANKS[0];
  for (const r of REPUTATION_RANKS) {
    if (level * 10 >= r.minScore) rank = r;
  }
  return rank;
}

function RankPosition({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return <span className="text-sm font-bold text-zinc-500 w-6 text-center">{rank}</span>;
}

function getLevelColor(level: number): string {
  return getRepRankForLevel(level).color;
}

export default function LeaderboardTable() {
  const [activeCategory, setActiveCategory] = useState("global-xp");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const realDisplayName = useMemo(() => {
    if (typeof window === "undefined") return "Player";
    return getRealDisplayName();
  }, []);

  const refresh = useCallback((categoryId: string) => {
  setLoading(true);
  setError(null);

  try {
    const data = getLeaderboard(categoryId, 100);
    setEntries(data);
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Unknown error generating leaderboard";

    setError(message);
    setEntries([]);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    setMounted(true);
    refresh(activeCategory);
  }, [activeCategory, refresh]);

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="inline-flex rounded-full bg-sky-500/15 px-4 py-1 text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">
          Leaderboards
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Top 100 Players
        </h1>
        <p className="mt-2 text-base text-zinc-400">
          Compete with the best. Earn XP, climb the ranks.
        </p>
      </div>

      {/* Category tabs */}
      <div className="mb-8 flex flex-wrap gap-2 justify-center">
        {LEADERBOARD_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeCategory === cat.id
                ? "bg-sky-500/20 text-sky-300 border border-sky-400/30"
                : "bg-zinc-800/50 text-zinc-400 border border-zinc-700 hover:border-zinc-600"
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-400 border-t-transparent mx-auto mb-4" />
            <p className="text-sm text-zinc-400">Loading leaderboard...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-900/20 p-8 text-center">
          <p className="text-3xl mb-3">⚠️</p>
          <p className="text-sm text-red-300 mb-2">Failed to load leaderboard</p>
          <p className="text-xs text-red-400/70 font-mono max-w-md mx-auto">{error}</p>
        </div>
      )}

      {/* Leaderboard table */}
      {!loading && !error && entries.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/70 overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-[60px_1fr_60px_100px_140px] lg:grid-cols-[60px_1fr_60px_120px_180px] gap-4 px-6 py-4 border-b border-white/5 text-xs uppercase tracking-wider text-zinc-500">
            <span>Rank</span>
            <span>Player</span>
            <span className="text-right">Level</span>
            <span className="text-right">{LEADERBOARD_CATEGORIES.find((c) => c.id === activeCategory)?.valueLabel || "Value"}</span>
            <span className="text-right hidden sm:block">Career</span>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-white/5">
            {entries.map((entry, index) => {
              const isRealUser = entry.displayName === realDisplayName;
              const isTop3 = entry.rank <= 3;
              const entryRank = getRepRankForLevel(entry.level);

              return (
                <div
                  key={`${entry.username}-${index}`}
                  className={`grid grid-cols-[40px_1fr_50px] sm:grid-cols-[60px_1fr_60px_100px_140px] lg:grid-cols-[60px_1fr_60px_120px_180px] gap-4 items-center px-4 sm:px-6 py-4 transition ${
                    isRealUser
                      ? "bg-sky-500/10 border-l-2 border-l-sky-400"
                      : isTop3
                      ? "bg-amber-500/5"
                      : "hover:bg-white/5"
                  }`}
                >
                  {/* Rank */}
                  <div className="flex justify-center">
                    <RankPosition rank={entry.rank} />
                  </div>

                  {/* Player info */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isRealUser
                        ? "bg-gradient-to-br from-sky-500 to-violet-600 text-white"
                        : "bg-zinc-800 text-zinc-300"
                    }`}>
                      {entry.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate flex items-center gap-1.5 ${
                        isRealUser ? "text-sky-300" : "text-white"
                      }`}>
                        {entry.displayName}
                        <span className="text-[10px]">{entryRank.icon}</span>
                        {isRealUser && (
                          <span className="ml-1 inline-flex items-center rounded-full bg-sky-500/20 px-1.5 py-0.5 text-[9px] font-medium text-sky-300">
                            You
                          </span>
                        )}
                      </p>
                      {/* Mobile career display */}
                      <p className="text-xs text-zinc-600 truncate sm:hidden">{entry.career}</p>
                    </div>
                  </div>

                  {/* Level */}
                  <div className="text-right">
                    <span className={`text-sm font-bold ${getLevelColor(entry.level)}`}>
                      {entry.level}
                    </span>
                  </div>

                  {/* Value */}
                  <div className="text-right">
                    <span className={`text-sm font-bold ${
                      activeCategory === "highest-average" ? "text-emerald-400" : "text-sky-400"
                    }`}>
                      {activeCategory === "highest-average" ? entry.value.toFixed(1) : entry.value.toLocaleString()}
                    </span>
                    <span className="ml-1 text-[10px] text-zinc-600">{entry.valueLabel}</span>
                  </div>

                  {/* Career */}
                  <div className="text-right hidden sm:block">
                    <span className="text-xs text-zinc-500 truncate block">{entry.career}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && entries.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-12 text-center">
          <p className="text-lg mb-2">📊</p>
          <p className="text-sm text-zinc-500">No leaderboard data available yet.</p>
        </div>
      )}
    </div>
  );
}