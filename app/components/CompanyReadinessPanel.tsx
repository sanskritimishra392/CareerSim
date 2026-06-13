"use client";

import { useState, useEffect } from "react";
import {
  getReadinessByTier,
  getReadinessColor,
  getReadinessBgColor,
  type ReadinessCategory,
} from "@/lib/readiness";
import { getStoredXp, getLevelForXp } from "@/lib/leveling";

interface Props {
  careerKey: string;
  showTitle?: boolean;
  maxDisplay?: number;
}

function ReadinessBar({ score, label }: { score: number; label: string }) {
  const color = getReadinessColor(score);
  const bgColor = getReadinessBgColor(score);

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-semibold ${color}`}>{label}</span>
        <span className={`text-xs font-bold ${color}`}>{score}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full ${bgColor} transition-all duration-700 ease-out group-hover:brightness-110`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function CompanyReadinessPanel({
  careerKey,
  showTitle = true,
  maxDisplay = 9,
}: Props) {
  const [tiers, setTiers] = useState<ReadinessCategory[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const xp = getStoredXp();
    const level = getLevelForXp(xp).level;
    const data = getReadinessByTier(careerKey, level, xp);
    setTiers(data);
  }, [careerKey]);

  if (!mounted) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6">
        <div className="flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (tiers.length === 0) return null;

  // Flatten companies up to maxDisplay
  let displayed = 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6">
      {showTitle && (
        <p className="text-xs uppercase tracking-wider text-zinc-400 mb-4">
          Company Readiness
        </p>
      )}

      <div className="space-y-5">
        {tiers.map((tier) => (
          <div key={tier.tierName}>
            <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-2 font-medium">
              {tier.tierName}
            </p>
            <div className="space-y-3">
              {tier.companies.map((company) => {
                if (displayed >= maxDisplay) return null;
                displayed++;
                return (
                  <ReadinessBar
                    key={company.companyId}
                    score={company.score}
                    label={company.companyName}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}