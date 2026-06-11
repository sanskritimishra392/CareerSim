"use client";

import { useEffect, useState } from "react";
import { getReputationRank, getReputationProgress, type ReputationRank } from "@/lib/ranks";

export function useReputationRank() {
  const [rank, setRank] = useState<ReputationRank | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRank(getReputationRank());
  }, []);

  return { rank, mounted };
}

export function useReputationProgress() {
  const [progress, setProgress] = useState<ReturnType<typeof getReputationProgress> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProgress(getReputationProgress());
  }, []);

  return { progress, mounted };
}

export function RankBadgeSmall({ rank }: { rank: ReputationRank }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold shadow-sm`}
      title={`${rank.name} (Tier ${rank.tier})`}
    >
      <span className="text-xs">{rank.icon}</span>
      <span className={rank.color}>{rank.name}</span>
    </span>
  );
}

export function RankBadgePill({ rank }: { rank: ReputationRank }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${rank.gradient} bg-clip-text px-2.5 py-0.5 text-xs font-bold text-transparent shadow-sm`}
    >
      <span>{rank.icon}</span>
      <span>{rank.name}</span>
    </span>
  );
}

export function RankBadgeFull({ rank, showProgress = false }: { rank: ReputationRank; showProgress?: boolean }) {
  const { progress } = useReputationProgress();

  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${rank.gradient} shadow-lg ${rank.bgGlow}`}
      >
        <span className="text-2xl">{rank.icon}</span>
      </div>
      <p className={`mt-1.5 text-xs font-bold ${rank.color}`}>{rank.name}</p>
      {showProgress && progress && (
        <div className="mt-1 w-full max-w-[100px]">
          <div className="flex items-center justify-between text-[8px] text-zinc-500">
            <span>T{progress.current}</span>
            <span>{progress.score}pts</span>
            <span>T{progress.next}</span>
          </div>
          <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500 transition-all duration-700"
              style={{ width: `${Math.min(100, (progress.score / (progress.current * 50 + 50)) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}