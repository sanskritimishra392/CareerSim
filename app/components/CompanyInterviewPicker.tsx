"use client";

import {
  getAllCompanies,
  isCompanyUnlocked,
  type Company,
} from "@/lib/companies";

interface CompanyInterviewPickerProps {
  careerKey: string;
  level: number;
  selectedCompanyId: string | null;
  onSelectCompany: (company: Company) => void;
  disabled?: boolean;
}

export function CompanyUnlockSummary({ level }: { level: number }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className={`rounded-xl border p-4 text-center ${level >= 1 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-zinc-700 bg-zinc-800/50'}`}>
        <p className="text-xs uppercase tracking-wider text-zinc-400">Level 1</p>
        <p className="mt-1 text-sm font-medium text-white">Startup</p>
        <p className="text-xs text-zinc-400">Entry-level interviews</p>
      </div>
      <div className={`rounded-xl border p-4 text-center ${level >= 3 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-zinc-700 bg-zinc-800/50'}`}>
        <p className="text-xs uppercase tracking-wider text-zinc-400">Level 3</p>
        <p className="mt-1 text-sm font-medium text-white">Mid-tier</p>
        <p className="text-xs text-zinc-400">Growth companies</p>
      </div>
      <div className={`rounded-xl border p-4 text-center ${level >= 5 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-zinc-700 bg-zinc-800/50'}`}>
        <p className="text-xs uppercase tracking-wider text-zinc-400">Level 5</p>
        <p className="mt-1 text-sm font-medium text-white">Top-tier</p>
        <p className="text-xs text-zinc-400">FAANG / Elite firms</p>
      </div>
    </div>
  );
}

export default function CompanyInterviewPicker({
  careerKey,
  level,
  selectedCompanyId,
  onSelectCompany,
  disabled = false,
}: CompanyInterviewPickerProps) {
  const companies = getAllCompanies(careerKey);

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6">
      <h2 className="text-lg font-semibold text-white mb-4">
        Choose Company
      </h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => {
          const unlocked = isCompanyUnlocked(
            careerKey,
            company.id,
            level
          );

          const selected =
            selectedCompanyId === company.id;

          return (
            <button
              key={company.id}
              disabled={!unlocked || disabled}
              onClick={() => onSelectCompany(company)}
              className={`p-4 rounded-xl border text-left ${
                selected
                  ? "border-sky-400 bg-sky-500/10"
                  : "border-white/10 bg-zinc-950"
              }`}
            >
              <div className="font-semibold">
                {company.name}
              </div>

              {!unlocked && (
                <div className="text-xs text-amber-300 mt-2">
                  Unlocks at Level {company.unlockLevel}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}