"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getProfile,
  updateProfile,
  computeStats,
  getEarnedBadges,
  type ProfileData,
  type ProfileStats,
  type Badge,
} from "@/lib/profile";
import StreakDisplay from "@/app/components/StreakDisplay";
import CompanyReadinessPanel from "@/app/components/CompanyReadinessPanel";
import { getLevelForXp, getStoredXp } from "@/lib/leveling";
import { getReputationRank, getReputationProgress } from "@/lib/ranks";
import { RankBadgeFull } from "@/app/components/RankBadge";

export default function ProfileCard() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: "", bio: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const xp = getStoredXp();
    const level = getLevelForXp(xp).level;
    const p = getProfile();
    const s = computeStats(xp, level);
    const b = getEarnedBadges(s);
    setProfile(p);
    setStats(s);
    setBadges(b);
    setEditForm({ displayName: p.displayName, bio: p.bio });
  }, []);

  if (!profile || !stats) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
      </div>
    );
  }

  const rank = getReputationRank();
  const repProgress = getReputationProgress();
  const levelInfo = getLevelForXp(stats.totalXp);

  const handleSave = () => {
    updateProfile({ displayName: editForm.displayName, bio: editForm.bio });
    setProfile(getProfile());
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const initials = profile.avatarInitials || profile.displayName.slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="space-y-8">
        {/* Profile Header Card */}
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-12">
          {/* Background decoration */}
          <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-violet-600 text-3xl font-bold text-white shadow-xl shadow-sky-500/20">
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              {editing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-2 text-lg font-semibold text-white placeholder-zinc-500 focus:border-sky-400/50 focus:outline-none"
                    placeholder="Display name"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-sky-400/50 focus:outline-none"
                    rows={3}
                    placeholder="Write a short bio..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="rounded-full border border-white/10 bg-zinc-800 px-6 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <h1 className="text-3xl font-semibold text-white">{profile.displayName}</h1>
                    {saved && (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-300">
                        Saved ✓
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400 max-w-xl">{profile.bio}</p>
                  <button
                    onClick={() => setEditing(true)}
                    className="mt-3 inline-flex items-center gap-1 rounded-full border border-white/10 bg-zinc-800/50 px-4 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                  >
                    ✏️ Edit Profile
                  </button>
                </>
              )}
            </div>

            {/* Reputation rank badge */}
            <RankBadgeFull rank={rank} showProgress />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-center">
            <p className="text-xs uppercase tracking-wider text-zinc-400">Level</p>
            <p className="mt-1 text-3xl font-bold text-white">{stats.level}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-center">
            <p className="text-xs uppercase tracking-wider text-zinc-400">Total XP</p>
            <p className="mt-1 text-3xl font-bold text-sky-400">{stats.totalXp}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-center">
            <p className="text-xs uppercase tracking-wider text-zinc-400">Simulations</p>
            <p className="mt-1 text-3xl font-bold text-violet-400">{stats.simulationsCompleted}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-center">
            <p className="text-xs uppercase tracking-wider text-zinc-400">Avg Score</p>
            <p className="mt-1 text-3xl font-bold text-emerald-400">{stats.averageScore}/10</p>
          </div>
        </div>

        {/* XP Progress */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400">Progress to Level {stats.level + 1}</span>
            <span className="text-xs text-zinc-400">{levelInfo.xpInCurrentLevel} / 100 XP</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500 transition-all duration-700"
              style={{ width: `${Math.min(100, levelInfo.progress * 100)}%` }}
            />
          </div>
        </div>

        {/* Streak + Career Track */}
        <div className="grid gap-4 sm:grid-cols-2">
          <StreakDisplay variant="full" />
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6">
            <p className="text-xs uppercase tracking-wider text-zinc-400 mb-3">Career Track</p>
            <p className="text-lg font-semibold text-white">{profile.careerTrack}</p>
            <p className="text-xs text-zinc-500 mt-1">
              Member since {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Company Readiness */}
        {profile.careerTrack !== "Not started" && (
          <CompanyReadinessPanel
            careerKey={profile.careerTrack.toLowerCase().replace(/\s+/g, "-")}
            showTitle={true}
          />
        )}

        {/* Top Skills */}
        {stats.topSkills.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6">
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

        {/* Badges */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-wider text-zinc-400">Badges</p>
            <Link href="/badges" className="text-xs font-medium text-sky-400 hover:text-sky-300 transition">
              View All →
            </Link>
          </div>
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {badges.slice(0, 8).map((badge) => (
                <div
                  key={badge.id}
                  className="rounded-xl border border-white/10 bg-zinc-950/50 p-4 text-center hover:bg-zinc-950/80 transition group"
                >
                  <span className="text-2xl group-hover:scale-110 transition inline-block">{badge.icon}</span>
                  <p className="mt-1 text-xs font-medium text-white">{badge.name}</p>
                  <p className="mt-0.5 text-[10px] text-zinc-500 leading-tight">{badge.description}</p>
                </div>
              ))}
              {badges.length > 8 && (
                <div className="rounded-xl border border-dashed border-white/10 bg-zinc-950/30 p-4 text-center flex items-center justify-center">
                  <Link href="/badges" className="text-xs font-medium text-sky-400 hover:text-sky-300 transition">
                    +{badges.length - 8} more
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl bg-zinc-950/50 p-6 text-center">
              <p className="text-sm text-zinc-500">Complete simulations to earn badges!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}