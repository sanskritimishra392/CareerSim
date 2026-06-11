"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getInterviewHistory,
  getFilteredHistory,
  getScoreTrends,
  getUniqueCategories,
  clearInterviewHistory,
  type HistoryFilter,
  type InterviewRecord,
} from "@/lib/interview-history";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  hard: "bg-red-500/15 text-red-300 border-red-500/30",
};

function TrendChart({ records }: { records: InterviewRecord[] }) {
  const { labels, scores, average, trend } = useMemo(() => getScoreTrends(records), [records]);

  if (records.length < 2) return null;

  const maxScore = 10;
  const height = 180;
  const width = 100;

  const points = scores
    .map((s, i) => {
      const x = (i / Math.max(scores.length - 1, 1)) * width;
      const y = height - (s / maxScore) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const gradientId = "scoreGradient";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">
            Score Trend
          </p>
          <p className="mt-0.5 text-2xl font-bold text-white">{average.toFixed(1)}</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {trend === "up" && (
            <span className="flex items-center gap-1 text-emerald-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              Improving
            </span>
          )}
          {trend === "down" && (
            <span className="flex items-center gap-1 text-rose-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Declining
            </span>
          )}
          {trend === "stable" && (
            <span className="flex items-center gap-1 text-zinc-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
              </svg>
              Stable
            </span>
          )}
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(56,189,248,0.3)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0)" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((pct) => {
          const y = (pct / 100) * height;
          const label = (10 - (pct / 100) * 10).toFixed(1);
          return (
            <g key={pct}>
              <line x1="0" y1={y} x2={width} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <text x="-4" y={y + 3} textAnchor="end" fill="rgba(255,255,255,0.15)" fontSize="6">
                {label}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill={`url(#${gradientId})`}
        />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="rgb(56,189,248)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {scores.map((s, i) => {
          const x = (i / Math.max(scores.length - 1, 1)) * width;
          const y = height - (s / maxScore) * height;
          return <circle key={i} cx={x} cy={y} r="2.5" fill="rgb(56,189,248)" stroke="rgb(14,20,30)" strokeWidth="1" />;
        })}
      </svg>

      {/* X-axis labels */}
      <div className="mt-2 flex justify-between">
        <span className="text-[10px] text-zinc-500">{labels[0]}</span>
        <span className="text-[10px] text-zinc-500">{labels[labels.length - 1]}</span>
      </div>
    </div>
  );
}

function FilterBar({
  filter,
  onChange,
  categories,
}: {
  filter: HistoryFilter;
  onChange: (f: HistoryFilter) => void;
  categories: string[];
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Category filter */}
      <div className="relative">
        <select
          className="appearance-none rounded-xl border border-white/10 bg-zinc-900/70 px-4 py-2.5 pr-8 text-sm text-zinc-300 focus:border-sky-400/50 focus:outline-none focus:ring-1 focus:ring-sky-400/50"
          value={filter.category ?? "all"}
          onChange={(e) => onChange({ ...filter, category: e.target.value === "all" ? undefined : e.target.value })}
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Difficulty filter */}
      <div className="relative">
        <select
          className="appearance-none rounded-xl border border-white/10 bg-zinc-900/70 px-4 py-2.5 pr-8 text-sm text-zinc-300 focus:border-sky-400/50 focus:outline-none focus:ring-1 focus:ring-sky-400/50"
          value={filter.difficulty ?? "all"}
          onChange={(e) => onChange({ ...filter, difficulty: e.target.value === "all" ? undefined : e.target.value })}
        >
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <svg className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Date range filter */}
      <div className="relative">
        <select
          className="appearance-none rounded-xl border border-white/10 bg-zinc-900/70 px-4 py-2.5 pr-8 text-sm text-zinc-300 focus:border-sky-400/50 focus:outline-none focus:ring-1 focus:ring-sky-400/50"
          value={filter.dateRange ?? "all"}
          onChange={(e) => onChange({ ...filter, dateRange: e.target.value as HistoryFilter["dateRange"] })}
        >
          <option value="all">All Time</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
        <svg className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<HistoryFilter>({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="h-64 animate-pulse rounded-3xl bg-white/[0.02]" />
      </div>
    );
  }

  const allHistory = getInterviewHistory();
  const filtered = getFilteredHistory(filter);
  const categories = getUniqueCategories();
  const avgScore = filtered.length > 0
    ? filtered.reduce((a, r) => a + r.averageScore, 0) / filtered.length
    : 0;
  const totalXp = filtered.reduce((a, r) => a + r.xpEarned, 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10">
        {/* Header */}
        <div className="mb-8 space-y-3">
          <p className="inline-flex rounded-full bg-sky-500/15 px-4 py-1 text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">
            Interview History
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                Your Performance History
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                {allHistory.length} total interview{allHistory.length !== 1 ? "s" : ""} completed
              </p>
            </div>
            {allHistory.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-4 py-2 text-xs font-medium text-red-400 transition hover:border-red-500/40 hover:bg-red-500/10"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear History
              </button>
            )}
          </div>
        </div>

        {/* Clear confirmation */}
        {showClearConfirm && (
          <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-300">
              Are you sure you want to clear all interview history? This action cannot be undone.
            </p>
            <div className="mt-3 flex gap-3">
              <button
                onClick={() => {
                  clearInterviewHistory();
                  setShowClearConfirm(false);
                  setFilter({});
                }}
                className="rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-400"
              >
                Yes, Clear All
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {allHistory.length === 0 ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="text-center">
              <span className="text-4xl">📋</span>
              <p className="mt-4 text-base text-zinc-400">
                No interview history yet. Complete a scenario to start tracking.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats summary */}
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Filtered Total</p>
                <p className="mt-1 text-2xl font-bold text-white">{filtered.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Avg Score</p>
                <p className="mt-1 text-2xl font-bold text-sky-400">{avgScore.toFixed(1)}/10</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">XP Earned</p>
                <p className="mt-1 text-2xl font-bold text-amber-400">{totalXp}</p>
              </div>
            </div>

            {/* Trend chart */}
            {filtered.length >= 2 && <TrendChart records={filtered} />}

            {/* Filters */}
            <div className="mt-6">
              <FilterBar filter={filter} onChange={setFilter} categories={categories} />
            </div>

            {/* Records list */}
            <div className="mt-6 space-y-3">
              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
                  <p className="text-sm text-zinc-500">No records match the current filters.</p>
                </div>
              ) : (
                filtered.map((record) => (
                  <div
                    key={record.id}
                    className="rounded-2xl border border-white/5 bg-zinc-900/50 p-4 transition hover:border-white/10 hover:bg-zinc-900/70"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-white truncate">
                            {record.scenarioTitle}
                          </h3>
                          <span
                            className={`inline-flex flex-shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                              DIFFICULTY_COLORS[record.difficulty] ?? "bg-zinc-500/15 text-zinc-300 border-zinc-500/30"
                            }`}
                          >
                            {record.difficulty}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
                          <span className="inline-flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {record.category}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(record.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Score</p>
                          <p className="text-lg font-bold text-sky-400">{record.averageScore.toFixed(1)}</p>
                        </div>
                        <div className="h-10 w-px bg-white/10" />
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider text-zinc-500">XP</p>
                          <p className="text-lg font-bold text-amber-400">+{record.xpEarned}</p>
                        </div>
                      </div>
                    </div>

                    {/* Mini score bars */}
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {(["relevance", "clarity", "reasoning"] as const).map((key) => {
                        const val = record.scores[key];
                        return (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wider text-zinc-500 w-14 flex-shrink-0">
                              {key.slice(0, 4)}
                            </span>
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  key === "relevance"
                                    ? "bg-sky-400"
                                    : key === "clarity"
                                    ? "bg-violet-400"
                                    : "bg-emerald-400"
                                }`}
                                style={{ width: `${(val / 10) * 100}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-medium text-zinc-400 w-5 text-right">
                              {val}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}