"use client";

import { useState, useEffect } from "react";
import {
  getSkills,
  getSkillProgress,
  getMasteredCount,
  getTotalSkillXp,
  type SkillNode,
  type SkillProgress,
  type SkillStatus,
} from "@/lib/skillTree";
import { slugToCareerKey } from "@/lib/scenarios";
import { getCareerByKey } from "@/lib/careers";
import { getLevelForXp, getStoredXp } from "@/lib/leveling";

interface Props {
  careerKey: string;
}

function SkillNodeCard({
  node,
  progress,
  onClick,
}: {
  node: SkillNode;
  progress: SkillProgress;
  onClick: () => void;
}) {
  const { status, xp } = progress;
  const progressPercent = node.xpToMaster > 0 ? Math.min(100, Math.round((xp / node.xpToMaster) * 100)) : 0;

  const statusStyles: Record<SkillStatus, string> = {
    mastered: "border-emerald-400/50 bg-emerald-500/15 shadow-emerald-500/20",
    unlocked: "border-sky-400/40 bg-sky-500/10 shadow-sky-500/15",
    locked: "border-zinc-700 bg-zinc-800/40 opacity-50",
  };

  const iconStyles: Record<SkillStatus, string> = {
    mastered: "bg-emerald-500/20 shadow-emerald-500/20",
    unlocked: "bg-sky-500/20 shadow-sky-500/20",
    locked: "bg-zinc-800 grayscale",
  };

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col items-center rounded-2xl border-2 p-4 transition-all duration-300 cursor-pointer hover:scale-105 ${statusStyles[status]}`}
    >
      {/* Icon */}
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl mb-2 ${iconStyles[status]}`}>
        {node.icon}
      </div>

      {/* Name */}
      <p className={`text-xs font-semibold text-center ${
        status === "mastered" ? "text-emerald-300" :
        status === "unlocked" ? "text-sky-200" : "text-zinc-500"
      }`}>
        {node.name}
      </p>

      {/* XP Progress bar */}
      {status !== "locked" && (
        <div className="w-full mt-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                status === "mastered" ? "bg-emerald-500" : "bg-sky-500"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className={`text-[10px] mt-0.5 text-center ${
            status === "mastered" ? "text-emerald-400" : "text-zinc-500"
          }`}>
            {xp}/{node.xpToMaster} XP
          </p>
        </div>
      )}

      {/* Status badge */}
      {status === "mastered" && (
        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white shadow shadow-emerald-500/50">
          ✓
        </span>
      )}
      {status === "locked" && (
        <p className="text-[10px] text-zinc-600 mt-1">L{Math.ceil(node.xpRequired / 100)}+</p>
      )}
    </div>
  );
}

function ConnectionLine({ from, to, isActive }: { from: { row: number; col: number }; to: { row: number; col: number }; isActive: boolean }) {
  // Simple connector rendered as a div with absolute positioning
  return (
    <div
      className={`absolute h-0.5 transition-all duration-500 ${
        isActive ? "bg-emerald-500/40" : "bg-zinc-800"
      }`}
      style={{
        // These are rough estimates. The actual SVG-based approach would be better but this works.
        left: "50%",
        right: "50%",
        top: "50%",
        transform: "translateY(-50%)",
      }}
    />
  );
}

export default function SkillTreeView({ careerKey }: Props) {
  const [mounted, setMounted] = useState(false);
  const [skills, setSkills] = useState<SkillNode[]>([]);
  const [progress, setProgress] = useState<SkillProgress[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    setMounted(true);
    const storedXp = getStoredXp();
    const lvl = getLevelForXp(storedXp).level;
    setXp(storedXp);
    setLevel(lvl);

    const s = getSkills(careerKey);
    const p = getSkillProgress(careerKey);
    setSkills(s);
    setProgress(p);
  }, [careerKey]);

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-zinc-500">No skill tree available for this career.</p>
      </div>
    );
  }

  const masteredCount = getMasteredCount(careerKey);
  const totalSkillXp = getTotalSkillXp(careerKey);

  // Get career title
  const internalKey = slugToCareerKey(careerKey);
  const careerConfig = internalKey ? getCareerByKey(internalKey) : null;
  const careerTitle = careerConfig?.title || careerKey.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // Group skills into rows
  const maxRows = Math.max(...skills.map((s) => s.row));
  const rows: { row: number; skills: { node: SkillNode; prog: SkillProgress }[] }[] = [];
  for (let r = 0; r <= maxRows; r++) {
    const rowSkills = skills
      .filter((s) => s.row === r)
      .sort((a, b) => a.column - b.column)
      .map((node) => ({
        node,
        prog: progress.find((p) => p.skillId === node.id) || { skillId: node.id, xp: 0, status: "locked" as SkillStatus, completions: 0 },
      }));
    if (rowSkills.length > 0) {
      rows.push({ row: r, skills: rowSkills });
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="inline-flex rounded-full bg-sky-500/15 px-4 py-1 text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">
          Skill Tree
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
          {careerTitle}
        </h1>
      </div>

      {/* Stats bar */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-zinc-400">Level</p>
          <p className="text-xl font-bold text-white">{level}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-zinc-400">Mastered</p>
          <p className="text-xl font-bold text-emerald-400">{masteredCount}/{skills.length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-zinc-400">Skill XP</p>
          <p className="text-xl font-bold text-sky-400">{totalSkillXp}</p>
        </div>
      </div>

      {/* Skill Tree Grid */}
      <div className="relative rounded-2xl border border-white/10 bg-zinc-900/70 p-6 sm:p-8">
        {/* Connection lines (simplified) */}
        {skills.map((node) =>
          node.dependencies.map((depId) => {
            const dep = skills.find((s) => s.id === depId);
            const depProg = progress.find((p) => p.skillId === depId);
            const isActive = depProg?.status === "mastered" || depProg?.status === "unlocked";
            return dep ? (
              <div
                key={`${depId}-${node.id}`}
                className="absolute pointer-events-none"
                style={{ display: "none" }} // Hidden in favor of the visual layout approach below
              />
            ) : null;
          })
        )}

        {/* Grid layout */}
        <div className="space-y-6">
          {rows.map((row) => (
            <div key={row.row} className="flex items-center justify-center gap-4 sm:gap-8">
              {row.skills.map(({ node, prog }) => (
                <div key={node.id} className="flex flex-col items-center">
                  <SkillNodeCard
                    node={node}
                    progress={prog}
                    onClick={() => setSelectedSkill(selectedSkill?.id === node.id ? null : node)}
                  />
                  {/* Dependencies indicator */}
                  {node.dependencies.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {node.dependencies.map((depId) => {
                        const depProg = progress.find((p) => p.skillId === depId);
                        const depMet = depProg?.status === "mastered" || depProg?.status === "unlocked";
                        return (
                          <span
                            key={depId}
                            className={`inline-block h-1.5 w-1.5 rounded-full ${
                              depMet ? "bg-emerald-500" : "bg-zinc-700"
                            }`}
                            title={`Requires: ${skills.find((s) => s.id === depId)?.name || depId}`}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
              {/* Fill remaining space if only 1 skill in row */}
              {row.skills.length === 1 && <div className="w-24" />}
            </div>
          ))}
        </div>
      </div>

      {/* Selected skill detail */}
      {selectedSkill && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-900/70 p-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-500/20 text-2xl">
              {selectedSkill.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{selectedSkill.name}</h3>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  progress.find((p) => p.skillId === selectedSkill.id)?.status === "mastered"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : progress.find((p) => p.skillId === selectedSkill.id)?.status === "unlocked"
                    ? "bg-sky-500/20 text-sky-300"
                    : "bg-zinc-800 text-zinc-500"
                }`}>
                  {progress.find((p) => p.skillId === selectedSkill.id)?.status === "mastered"
                    ? "Mastered"
                    : progress.find((p) => p.skillId === selectedSkill.id)?.status === "unlocked"
                    ? "In Progress"
                    : "Locked"}
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-1">{selectedSkill.description}</p>
              <p className="text-xs text-zinc-500 mt-1">{selectedSkill.category}</p>

              {/* Progress bar */}
              {progress.find((p) => p.skillId === selectedSkill.id)?.status !== "locked" && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                    <span>XP Progress</span>
                    <span>{progress.find((p) => p.skillId === selectedSkill.id)?.xp || 0} / {selectedSkill.xpToMaster}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progress.find((p) => p.skillId === selectedSkill.id)?.status === "mastered"
                          ? "bg-emerald-500"
                          : "bg-gradient-to-r from-sky-500 to-violet-500"
                      }`}
                      style={{
                        width: `${Math.min(100, ((progress.find((p) => p.skillId === selectedSkill.id)?.xp || 0) / selectedSkill.xpToMaster) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Prerequisites */}
              {selectedSkill.dependencies.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-zinc-500 mb-1">Requires:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSkill.dependencies.map((depId) => {
                      const dep = skills.find((s) => s.id === depId);
                      const depProg = progress.find((p) => p.skillId === depId);
                      const met = depProg?.status === "mastered" || depProg?.status === "unlocked";
                      return (
                        <span
                          key={depId}
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            met
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-zinc-800 text-zinc-500"
                          }`}
                        >
                          {met ? "✓" : "○"} {dep?.name || depId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}