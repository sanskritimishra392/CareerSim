"use client";

import { getUnlockedCompanies, getCompanyTiers, type CompanyTier } from "@/lib/companies";

interface CompanyUnlockPanelProps {
  careerKey: string;
  level: number;
}

export default function CompanyUnlockPanel({
  careerKey,
  level,
}: CompanyUnlockPanelProps) {
  const unlockedCompanies = getUnlockedCompanies(careerKey, level);
  const tiers = getCompanyTiers(careerKey);

  if (tiers.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6">
      <h2 className="text-lg font-semibold text-white mb-4">
        Unlocked Companies
      </h2>

      <div className="space-y-4">
        {tiers.map((tier) => {
          const tierUnlocked = level >= tier.minLevel;
          const unlockedInTier = tier.companies.filter((c) => level >= c.unlockLevel);

          return (
            <div
              key={tier.name}
              className={`rounded-xl border p-4 transition ${
                tierUnlocked
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-zinc-700 bg-zinc-800/30 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-wider text-zinc-400">
                  {tier.name}
                </p>
                <p className="text-xs text-zinc-500">
                  Level {tier.minLevel}{tier.maxLevel > tier.minLevel ? `-${tier.maxLevel}` : "+"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {tier.companies.map((company) => {
                  const unlocked = level >= company.unlockLevel;
                  return (
                    <span
                      key={company.id}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                        unlocked
                          ? "bg-zinc-800 text-zinc-200 border border-white/10"
                          : "bg-zinc-900 text-zinc-600 border border-zinc-800"
                      }`}
                    >
                      {unlocked ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                      )}
                      {company.name}
                    </span>
                  );
                })}
              </div>
              {unlockedInTier.length > 0 && unlockedInTier.length < tier.companies.length && (
                <p className="mt-2 text-xs text-amber-400">
                  {tier.companies.length - unlockedInTier.length} more unlock at higher levels in this tier
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}