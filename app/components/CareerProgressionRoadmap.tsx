"use client";

import { getLevelForXp, getStoredXp } from "@/lib/leveling";
import {
  ROADMAPS,
  getStageForLevel,
  getNextStage,
  getProgressToNextStage,
  type CareerStage,
} from "@/lib/roadmaps";
import { useEffect, useState } from "react";

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; glow: string; dot: string }> = {
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-300", glow: "shadow-emerald-500/20", dot: "bg-emerald-400" },
  teal: { bg: "bg-teal-500/10", border: "border-teal-500/30", text: "text-teal-300", glow: "shadow-teal-500/20", dot: "bg-teal-400" },
  sky: { bg: "bg-sky-500/10", border: "border-sky-500/30", text: "text-sky-300", glow: "shadow-sky-500/20", dot: "bg-sky-400" },
  indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/30", text: "text-indigo-300", glow: "shadow-indigo-500/20", dot: "bg-indigo-400" },
  violet: { bg: "bg-violet-500/10", border: "border-violet-500/30", text: "text-violet-300", glow: "shadow-violet-500/20", dot: "bg-violet-400" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-300", glow: "shadow-amber-500/20", dot: "bg-amber-400" },
};

function DotIcon({ color, active }: { color: string; active: boolean }) {
  const c = COLOR_MAP[color];
  return (
    <div
      className={`relative flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
        active ? `${c.dot} shadow-lg ${c.glow} scale-110` : "bg-zinc-700"
      }`}
    >
      {active && (
        <span className="absolute h-3 w-3 animate-ping rounded-full bg-white/40" />
      )}
    </div>
  );
}

function StageCard({
  stage,
  isCurrent,
  isNext,
  isCompleted,
  progress,
}: {
  stage: CareerStage;
  isCurrent: boolean;
  isNext: boolean;
  isCompleted: boolean;
  progress: number;
}) {
  const c = COLOR_MAP[stage.color];

  return (
    <div
      className={`group relative rounded-2xl border p-5 transition-all duration-500 ${
        isCurrent
          ? `${c.border} ${c.bg} shadow-lg ${c.glow} scale-[1.02]`
          : isCompleted
          ? "border-emerald-500/20 bg-emerald-500/5 opacity-80"
          : "border-white/5 bg-zinc-900/50 opacity-50 hover:opacity-70"
      }`}
    >
      {/* Status badge */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{stage.icon}</span>
          <h3
            className={`text-base font-semibold ${
              isCurrent ? c.text : isCompleted ? "text-emerald-300" : "text-zinc-400"
            }`}
          >
            {stage.title}
          </h3>
        </div>
        {isCurrent && (
          <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            Current
          </span>
        )}
        {isNext && (
          <span className="inline-flex items-center rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-300">
            Next
          </span>
        )}
        {isCompleted && (
          <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
            ✓ Completed
          </span>
        )}
      </div>

      {/* Description */}
      <p className="mb-3 text-sm leading-6 text-zinc-400">
        {stage.description}
      </p>

      {/* Level range */}
      <div className="mb-3 flex items-center gap-1.5 text-xs text-zinc-500">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <span>
          Level {stage.minLevel}{stage.maxLevel === Infinity ? "+" : `–${stage.maxLevel}`}
        </span>
      </div>

      {/* Requirements */}
      <div className={`space-y-1.5 ${isCurrent || isNext ? "" : "hidden group-hover:block"}`}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
          Requirements
        </p>
        <ul className="space-y-1">
          {stage.requirements.map((req, i) => (
            <li key={i} className="flex items-start gap-2 text-xs leading-5 text-zinc-300">
              <span className={`mt-1 h-1 w-1 flex-shrink-0 rounded-full ${isCurrent ? c.dot : "bg-zinc-600"}`} />
              {req}
            </li>
          ))}
        </ul>
      </div>

      {/* Progress bar for current stage */}
      {isCurrent && progress > 0 && progress < 1 && (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-[10px] text-zinc-500">
            <span>Progress to {ROADMAPS.softwareEngineer[ROADMAPS.softwareEngineer.indexOf(stage) + 1]?.shortTitle || "next stage"}</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out ${
                stage.color === "emerald" ? "from-emerald-500 to-teal-400"
                : stage.color === "teal" ? "from-teal-500 to-sky-400"
                : stage.color === "sky" ? "from-sky-500 to-indigo-400"
                : stage.color === "indigo" ? "from-indigo-500 to-violet-400"
                : stage.color === "violet" ? "from-violet-500 to-purple-400"
                : "from-amber-500 to-orange-400"
              }`}
              style={{ width: `${Math.min(100, progress * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Level ups needed for next stage */}
      {isNext && (
        <div className="mt-3 rounded-xl bg-white/[0.03] px-3 py-2">
          <p className="text-[10px] text-zinc-500">
            Reach Level {stage.minLevel} to unlock this stage
          </p>
        </div>
      )}
    </div>
  );
}

export default function CareerProgressionRoadmap() {
  const [mounted, setMounted] = useState(false);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    setMounted(true);
    setXp(getStoredXp());
  }, []);

  // Listen for XP changes
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      const newXp = getStoredXp();
      if (newXp !== xp) setXp(newXp);
    }, 2000);
    return () => clearInterval(interval);
  }, [mounted, xp]);

  if (!mounted) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="h-6 w-48 animate-pulse rounded bg-white/5" />
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/[0.02]" />
          ))}
        </div>
      </div>
    );
  }

  const levelData = getLevelForXp(xp);
  const level = levelData.level;
  const stages = ROADMAPS.softwareEngineer;
  const currentStage = getStageForLevel(level);
  const nextStage = getNextStage(currentStage);
  const progress = getProgressToNextStage(level, currentStage, nextStage);

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex rounded-full bg-amber-500/15 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">
            Career Progression
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
            Software Engineer Roadmap
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Current Level</p>
            <p className="text-xl font-bold text-white">{level}</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Current Stage</p>
            <p className="text-sm font-semibold text-amber-300">{currentStage?.shortTitle || "—"}</p>
          </div>
        </div>
      </div>

      {/* Current / Next summary */}
      {currentStage && (
        <div className="mb-8 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentStage.icon}</span>
              <div>
                <p className="text-xs text-zinc-500">You are here</p>
                <p className="text-base font-semibold text-white">{currentStage.title}</p>
              </div>
            </div>
            {nextStage && (
              <>
                <div className="hidden text-zinc-600 sm:block">→</div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl opacity-50">{nextStage.icon}</span>
                  <div>
                    <p className="text-xs text-zinc-500">Next stage</p>
                    <p className="text-base font-semibold text-zinc-400">{nextStage.title}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[6px] top-3 h-[calc(100%-24px)] w-0.5 bg-gradient-to-b from-sky-500/40 via-indigo-500/20 to-zinc-700" />

        <div className="space-y-4">
          {stages.map((stage) => {
            const isCurrentStage = currentStage?.id === stage.id;
            const stageIndex = stages.findIndex((s) => s.id === stage.id);
            const currentIndex = stages.findIndex((s) => s.id === currentStage?.id);
            const isCompleted = stageIndex < currentIndex;
            const isNextStage = stage.id === nextStage?.id;
            const progressToNext = isCurrentStage ? progress : 0;

            return (
              <div key={stage.id} className="relative flex gap-4">
                {/* Dot */}
                <div className="relative z-10 flex flex-col items-center pt-2">
                  <DotIcon color={stage.color} active={isCurrentStage} />
                </div>

                {/* Card */}
                <div className="min-w-0 flex-1">
                  <StageCard
                    stage={stage}
                    isCurrent={isCurrentStage}
                    isNext={isNextStage}
                    isCompleted={isCompleted}
                    progress={progressToNext}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}