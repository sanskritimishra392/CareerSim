"use client";

import { getLevelForXp, XP_PER_LEVEL } from "@/lib/leveling";

interface CareerNode {
  id: string;
  title: string;
  description: string;
  icon: string;
  levelRequired: number;
}

const CAREER_NODES: CareerNode[] = [
  {
    id: "explorer",
    title: "Explorer",
    description: "Begin your career simulation journey",
    icon: "🧭",
    levelRequired: 1,
  },
  {
    id: "apprentice",
    title: "Apprentice",
    description: "Complete your first simulation",
    icon: "🔰",
    levelRequired: 2,
  },
  {
    id: "practitioner",
    title: "Practitioner",
    description: "Master core interview skills",
    icon: "⚡",
    levelRequired: 4,
  },
  {
    id: "specialist",
    title: "Specialist",
    description: "Excel at mid-tier company interviews",
    icon: "🎯",
    levelRequired: 7,
  },
  {
    id: "senior",
    title: "Senior",
    description: "Tackle senior-level scenarios",
    icon: "🏆",
    levelRequired: 10,
  },
  {
    id: "expert",
    title: "Expert",
    description: "Conquer top-tier company challenges",
    icon: "👑",
    levelRequired: 13,
  },
];

interface CareerMapProps {
  totalXp: number;
  onSelectNode?: (node: CareerNode) => void;
}

export default function CareerMap({ totalXp, onSelectNode }: CareerMapProps) {
  const { level, progress, xpInCurrentLevel } = getLevelForXp(totalXp);

  const getNodeStatus = (node: CareerNode): "locked" | "unlocked" | "completed" => {
    if (node.levelRequired < level) return "completed";
    if (node.levelRequired === level) return "unlocked";
    return "locked";
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <p className="inline-flex rounded-full bg-sky-500/15 px-4 py-1 text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">
          Career Progression Map
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Your Simulation Journey
        </h1>
        <p className="mt-2 text-base leading-8 text-zinc-300">
          Complete simulations to earn XP, level up, and unlock new challenges.
        </p>
      </div>

      {/* Level & XP Badge */}
      <div className="mb-10 flex items-center justify-center gap-6">
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900/70 px-6 py-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 text-2xl font-bold text-white shadow-lg shadow-sky-500/25">
            {level}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400">Current Level</p>
            <p className="text-lg font-semibold text-white">
              {level === 1 ? "Explorer" :
               level <= 3 ? "Apprentice" :
               level <= 6 ? "Practitioner" :
               level <= 9 ? "Specialist" :
               level <= 12 ? "Senior" : "Expert"}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-900/70 px-6 py-4 text-center">
          <p className="text-xs uppercase tracking-wider text-zinc-400">Total XP</p>
          <p className="text-2xl font-bold text-sky-400">{totalXp}</p>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-12 rounded-2xl border border-white/10 bg-zinc-900/50 p-5">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
          <span>Level {level}</span>
          <span>{xpInCurrentLevel} / {XP_PER_LEVEL} XP to next level</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 via-violet-500 to-emerald-500 transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, progress * 100)}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-zinc-500">
          <span>{(level - 1) * XP_PER_LEVEL} XP</span>
          <span>{level * XP_PER_LEVEL} XP</span>
        </div>
      </div>

      {/* Vertical Progression Path */}
      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-8 top-0 h-full w-0.5 bg-gradient-to-b from-sky-500/50 via-violet-500/30 to-zinc-700/20" />

        <div className="relative space-y-10">
          {CAREER_NODES.map((node) => {
            const status = getNodeStatus(node);

            return (
              <div
                key={node.id}
                className="relative flex items-start gap-6 group"
              >
                {/* Node icon on timeline */}
                <div
                  className={`relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 text-2xl transition-all duration-300 ${
                    status === "completed"
                      ? "border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/20 scale-100"
                      : status === "unlocked"
                      ? "border-sky-400 bg-sky-500/20 shadow-lg shadow-sky-500/20 scale-110 animate-pulse"
                      : "border-zinc-700 bg-zinc-800/50 opacity-50 scale-95"
                  }`}
                >
                  {status === "completed" && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
                      ✓
                    </span>
                  )}
                  {node.icon}
                </div>

                {/* Card */}
                <div
                  onClick={() => status !== "locked" && onSelectNode?.(node)}
                  className={`flex-1 rounded-3xl border p-6 transition-all duration-300 ${
                    status === "locked"
                      ? "border-white/5 bg-zinc-900/30 opacity-60"
                      : status === "unlocked"
                      ? "border-sky-400/40 bg-zinc-900/80 hover:border-sky-400/60 hover:bg-zinc-900 cursor-pointer shadow-lg shadow-sky-500/10"
                      : "border-white/10 bg-zinc-900/70 hover:border-emerald-400/30 hover:bg-zinc-900/80 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`text-lg font-semibold ${
                          status === "completed" ? "text-emerald-300" :
                          status === "unlocked" ? "text-sky-300" : "text-zinc-500"
                        }`}>
                          {node.title}
                        </h3>
                        {status === "unlocked" && (
                          <span className="inline-flex items-center rounded-full bg-sky-500/20 px-2 py-0.5 text-xs font-medium text-sky-300 animate-pulse">
                            Available Now
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-zinc-400">
                        {node.description}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-zinc-500">
                        Level {node.levelRequired}
                      </p>
                      <p
                        className={`mt-1 text-xs font-medium uppercase ${
                          status === "completed"
                            ? "text-emerald-400"
                            : status === "unlocked"
                            ? "text-sky-400"
                            : "text-zinc-600"
                        }`}
                      >
                        {status === "completed" ? "Completed" :
                         status === "unlocked" ? "Active" : "Locked"}
                      </p>
                    </div>
                  </div>

                  {/* Progress indicator for locked nodes */}
                  {status === "locked" && (
                    <div className="mt-3">
                      <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-zinc-600"
                          style={{
                            width: `${Math.min(100, ((level - 1) / (node.levelRequired - 1)) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-zinc-600">
                        {node.levelRequired - level} more levels to unlock
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export type { CareerNode };