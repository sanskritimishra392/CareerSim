"use client";

import { useState } from "react";
import type { AIMentorResult } from "@/lib/ai-mentor-prompt";

interface AIMentorCardProps {
  answer: string;
  scenario: string;
  careerKey: string;
  category?: string;
  difficulty?: string;
}

interface MentorSection {
  key: keyof AIMentorResult;
  label: string;
  icon: string;
  gradient: string;
  accent: string;
}

const SECTIONS: MentorSection[] = [
  {
    key: "strengths",
    label: "Strengths",
    icon: "✦",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    accent: "border-emerald-500/30 text-emerald-300",
  },
  {
    key: "weaknesses",
    label: "Weaknesses",
    icon: "▲",
    gradient: "from-amber-500/20 to-amber-500/5",
    accent: "border-amber-500/30 text-amber-300",
  },
  {
    key: "missedConcepts",
    label: "Missed Concepts",
    icon: "⊙",
    gradient: "from-rose-500/20 to-rose-500/5",
    accent: "border-rose-500/30 text-rose-300",
  },
  {
    key: "improvements",
    label: "Improvement Suggestions",
    icon: "→",
    gradient: "from-violet-500/20 to-violet-500/5",
    accent: "border-violet-500/30 text-violet-300",
  },
  {
    key: "recommendedTopic",
    label: "Recommended Next Topic",
    icon: "◈",
    gradient: "from-sky-500/20 to-sky-500/5",
    accent: "border-sky-500/30 text-sky-300",
  },
];

export default function AIMentorCard({
  answer,
  scenario,
  careerKey,
  category,
  difficulty,
}: AIMentorCardProps) {
  const [mentorResult, setMentorResult] = useState<AIMentorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMentorFeedback = async () => {
    if (mentorResult) return; // Already loaded
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai-mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer,
          scenario,
          careerKey,
          category,
          difficulty,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Mentor analysis failed");
      }

      setMentorResult(data as AIMentorResult);
      setExpanded(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 shadow-[0_20px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300">
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between p-5 transition-colors hover:bg-white/[0.02]"
        onClick={() => {
          if (!mentorResult && !loading) {
            fetchMentorFeedback();
          } else {
            setExpanded((prev) => !prev);
          }
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!mentorResult && !loading) {
              fetchMentorFeedback();
            } else {
              setExpanded((prev) => !prev);
            }
          }
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 ring-1 ring-white/10">
            <span className="text-lg">🧠</span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">AI Mentor</h3>
            <p className="text-xs text-zinc-500">
              {mentorResult ? "Tap to toggle analysis" : "Tap for personalized mentorship"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {loading && (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          )}
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
              expanded ? "bg-indigo-500/20 rotate-180" : "bg-white/5"
            }`}
          >
            <svg
              className={`h-4 w-4 text-zinc-400 transition-transform duration-300 ${
                expanded ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          expanded && mentorResult ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {error && (
          <div className="mx-5 mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-300">{error}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setError(null);
                fetchMentorFeedback();
              }}
              className="mt-2 text-xs font-medium text-red-400 underline underline-offset-2 hover:text-red-300"
            >
              Try again
            </button>
          </div>
        )}

        {mentorResult && (
          <div className="space-y-3 px-5 pb-6">
            {SECTIONS.map((section) => {
              const content = mentorResult[section.key];
              const IconComponent = section.icon;

              return (
                <div
                  key={section.key}
                  className={`rounded-2xl border bg-gradient-to-br ${section.gradient} ${section.accent} p-4 transition-all duration-300 hover:scale-[1.01]`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/5 text-sm">
                      {IconComponent}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.15em] opacity-70">
                        {section.label}
                      </p>
                      <p className="text-sm leading-6 text-zinc-200">
                        {content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Footer */}
            <div className="flex items-center gap-2 pt-1 text-xs text-zinc-500">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Analysis powered by Gemini — tailored to your career path
            </div>
          </div>
        )}

        {/* Skeleton while loading */}
        {loading && !mentorResult && (
          <div className="space-y-3 px-5 pb-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-white/5 bg-white/[0.02] p-4"
              >
                <div className="mb-2 h-3 w-20 rounded bg-white/5" />
                <div className="space-y-1.5">
                  <div className="h-3 w-full rounded bg-white/5" />
                  <div className="h-3 w-5/6 rounded bg-white/5" />
                  <div className="h-3 w-4/6 rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}