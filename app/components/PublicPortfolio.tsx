"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  getProfile,
  computeStats,
  getEarnedBadges,
  type ProfileData,
} from "@/lib/profile";
import { getLevelForXp, getStoredXp } from "@/lib/leveling";
import {
  getReputationRank,
} from "@/lib/ranks";
import { RankBadgeFull } from "@/app/components/RankBadge";
import { getInterviewHistory } from "@/lib/interview-history";
import { getEarnedIds } from "@/lib/achievements";
import { getStreakData } from "@/lib/streak";
import { getUniqueCategories } from "@/lib/interview-history";

interface PublicPortfolioProps {
  username: string;
}

export default function PublicPortfolio({ username }: PublicPortfolioProps) {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [xp, setXp] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = getProfile();
    const storedXp = getStoredXp();
    setProfile(stored);
    setXp(storedXp);
  }, []);

  const levelData = getLevelForXp(xp);
  const rank = useMemo(() => mounted ? getReputationRank() : null, [mounted]);
  const stats = useMemo(() => profile ? computeStats(xp, levelData.level) : null, [profile, xp, levelData.level]);
  const badges = useMemo(() => stats ? getEarnedBadges(stats) : [], [stats]);
  const history = useMemo(() => mounted ? getInterviewHistory() : [], [mounted]);
  const categories = useMemo(() => mounted ? getUniqueCategories() : [], [mounted]);
  const streak = useMemo(() => mounted ? getStreakData() : null, [mounted]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!mounted || !profile || !stats || !rank) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
      </div>
    );
  }

  const initials = profile.avatarInitials || profile.displayName.slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Share button floating top-right */}
      <div className="mb-6 flex items-center justify-between">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs text-zinc-500">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          careersim.app/u/{username}
        </p>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400"
        >
          {copied ? (
            <>✓ Copied!</>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Portfolio
            </>
          )}
        </button>
      </div>

      {/* Main card */}
      <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10">
        {/* Profile header */}
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-violet-600 text-2xl font-bold text-white shadow-xl shadow-sky-500/20">
            {initials}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <h1 className="text-2xl font-semibold text-white sm:text-3xl">{profile.displayName}</h1>
              {rank && <span className="text-xl">{rank.icon}</span>}
            </div>
            <p className="mt-1 text-sm leading-6 text-zinc-400 max-w-lg">{profile.bio}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 justify-center sm:justify-start">
              <span className="inline-flex items-center rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
                Level {levelData.level}
              </span>
              <span className="inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                {xp} XP
              </span>
              {profile.careerTrack !== "Not started" && (
                <span className="inline-flex items-center rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                  {profile.careerTrack}
                </span>
              )}
            </div>
          </div>

          {/* Rank badge */}
          <div className="hidden sm:block">
            <RankBadgeFull rank={rank} showProgress />
          </div>
        </div>

        {/* Stats grid */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4 text-center">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Level</p>
            <p className="mt-1 text-2xl font-bold text-white">{levelData.level}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4 text-center">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Total XP</p>
            <p className="mt-1 text-2xl font-bold text-sky-400">{xp}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4 text-center">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Simulations</p>
            <p className="mt-1 text-2xl font-bold text-violet-400">{stats.simulationsCompleted}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4 text-center">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Avg Score</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">{stats.averageScore}/10</p>
          </div>
        </div>

        {/* Reputation rank progress on mobile */}
        <div className="mt-4 sm:hidden">
          <RankBadgeFull rank={rank} showProgress />
        </div>

        {/* XP Progress */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400">Progress to Level {levelData.level + 1}</span>
            <span className="text-xs text-zinc-400">{levelData.xpInCurrentLevel} / 100 XP</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500 transition-all duration-700"
              style={{ width: `${Math.min(100, levelData.progress * 100)}%` }}
            />
          </div>
        </div>

        {/* Streak */}
        {streak && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{streak.currentStreak >= 3 ? "🔥" : "⚪"}</span>
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-400">Current Streak</p>
                <p className="text-lg font-bold text-white">{streak.currentStreak} day{streak.currentStreak !== 1 ? "s" : ""}</p>
              </div>
            </div>
          </div>
        )}

        {/* Top Skills */}
        {stats.topSkills.length > 0 && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
            <p className="text-xs uppercase tracking-wider text-zinc-400 mb-3">Top Skills</p>
            <div className="flex flex-wrap gap-2">
              {stats.topSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-full bg-sky-500/10 px-3 py-1.5 text-sm font-medium text-sky-300 border border-sky-500/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Achievements / Badges */}
        {badges.length > 0 && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
            <p className="text-xs uppercase tracking-wider text-zinc-400 mb-4">Badges & Achievements</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {badges.slice(0, 12).map((badge) => (
                <div
                  key={badge.id}
                  className="rounded-xl border border-white/10 bg-zinc-950/50 p-3 text-center hover:bg-zinc-950/80 transition group"
                >
                  <span className="text-xl group-hover:scale-110 transition inline-block">{badge.icon}</span>
                  <p className="mt-1 text-[10px] font-medium text-white leading-tight">{badge.name}</p>
                </div>
              ))}
              {badges.length > 12 && (
                <div className="rounded-xl border border-dashed border-white/10 bg-zinc-950/30 p-3 text-center flex items-center justify-center">
                  <span className="text-[10px] text-zinc-500">+{badges.length - 12} more</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Simulation History Summary */}
        {history.length > 0 && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
            <p className="text-xs uppercase tracking-wider text-zinc-400 mb-3">Simulation History</p>
            <div className="space-y-2">
              {history.slice(0, 5).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between rounded-xl bg-zinc-950/50 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{record.scenarioTitle}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-zinc-500">{record.category}</span>
                      <span className="text-[10px] text-zinc-600">·</span>
                      <span className="text-[10px] text-zinc-500">{record.difficulty}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs font-bold text-sky-400">{record.averageScore.toFixed(1)}</span>
                    <span className="text-[10px] font-medium text-amber-500">+{record.xpEarned} XP</span>
                  </div>
                </div>
              ))}
              {history.length > 5 && (
                <p className="text-xs text-zinc-500 text-center pt-1">
                  +{history.length - 5} more simulations completed
                </p>
              )}
            </div>
          </div>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
            <p className="text-xs uppercase tracking-wider text-zinc-400 mb-3">Practice Areas</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 border border-white/10"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 border-t border-white/5 pt-6 text-center">
          <p className="text-xs text-zinc-600">
            Built with <span className="text-sky-400">CareerSim</span> — Level up your career, one simulation at a time.
          </p>
          <Link
            href="/"
            className="mt-2 inline-flex items-center text-xs font-medium text-sky-400 hover:text-sky-300 transition"
          >
            Join CareerSim →
          </Link>
        </div>
      </div>
    </div>
  );
}