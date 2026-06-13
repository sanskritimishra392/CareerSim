"use client";

import type { ActiveScenario } from "@/lib/scenario-types";
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS, PHASE_LABELS } from "@/lib/scenario-types";

interface ScenarioCardProps {
  scenario: ActiveScenario;
}

export default function ScenarioCard({ scenario }: ScenarioCardProps) {
  const currentRound = scenario.rounds[scenario.currentRound - 1];
  if (!currentRound) return null;

  const diffColor = DIFFICULTY_COLORS[scenario.difficulty];

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6 shadow-lg sm:p-8">
      {/* Round indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-300">
            Round {scenario.currentRound} of {scenario.totalRounds}
          </span>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${diffColor}`}>
              {DIFFICULTY_LABELS[scenario.difficulty]}
            </span>
            <span className="inline-flex items-center rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
              {scenario.xpReward} XP
            </span>
          </div>
        </div>
        <h3 className="text-sm font-medium text-violet-400">
          {PHASE_LABELS[currentRound.phase]}
        </h3>
      </div>

      {/* Round progress dots */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map((round) => {
          const isCompleted = round < scenario.currentRound;
          const isCurrent = round === scenario.currentRound;

          return (
            <div key={round} className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                isCompleted
                  ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400/30"
                  : isCurrent
                  ? "bg-sky-500/30 text-sky-300 border border-sky-400/30 ring-2 ring-sky-500/30"
                  : "bg-zinc-800 text-zinc-600 border border-zinc-700"
              }`}>
                {isCompleted ? "✓" : round}
              </div>
              {round < 4 && (
                <div className={`h-0.5 w-6 rounded ${
                  round < scenario.currentRound ? "bg-emerald-500/40" : "bg-zinc-700"
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Context */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Context</p>
        <p className="text-base leading-7 text-zinc-300">
          {currentRound.context}
        </p>
      </div>

      {/* Problem */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Problem</p>
        <p className="text-lg font-semibold leading-8 text-white">
          {currentRound.problem}
        </p>
      </div>

      {/* Constraints */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Constraints</p>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-sm leading-7 text-amber-200 whitespace-pre-line">
            {currentRound.constraints}
          </p>
        </div>
      </div>

      {/* Questions */}
      <div className="mb-4">
        <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Questions</p>
        <ul className="space-y-2">
          {currentRound.questions.map((q, i) => (
            <li key={i} className="flex items-start gap-3 text-sm leading-7 text-zinc-200">
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-xs font-bold text-sky-400">
                {i + 1}
              </span>
              <span>{q}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Asked by companies */}
      {scenario.relevantCompanies.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2">
          <span className="text-xs text-zinc-500">Asked by:</span>
          <div className="flex flex-wrap gap-1.5">
            {scenario.relevantCompanies.map((name) => (
              <span
                key={name}
                className="inline-flex items-center rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-medium text-sky-300"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}