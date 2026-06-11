"use client";

import { useState, useEffect, useCallback } from "react";
import type { AchievementNotification as NotificationType } from "@/lib/achievements";

interface Props {
  notifications: NotificationType[];
  onDismiss: (ids: string[]) => void;
}

export default function AchievementNotification({
  notifications,
  onDismiss,
}: Props) {
  const [visible, setVisible] = useState<NotificationType[]>([]);
  const [dismissing, setDismissing] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (notifications.length > 0) {
      // Show new notifications one at a time
      const timer = setTimeout(() => {
        setVisible(notifications.slice(0, 1));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const dismiss = useCallback((id: string) => {
    setDismissing((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setVisible([]);
      setDismissing(new Set());
      onDismiss([id]);
    }, 400);
  }, [onDismiss]);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (visible.length > 0) {
      const timer = setTimeout(() => {
        dismiss(visible[0].id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible, dismiss]);

  if (visible.length === 0) return null;

  const notification = visible[0];
  const isDismissing = dismissing.has(notification.id);

  return (
    <div className="fixed top-20 right-6 z-50 max-w-sm">
      <div
        className={`rounded-2xl border border-amber-500/30 bg-gradient-to-br from-zinc-900 to-zinc-900/95 p-5 shadow-2xl shadow-amber-500/10 backdrop-blur-xl transition-all duration-300 ${
          isDismissing ? "opacity-0 translate-x-4 scale-95" : "opacity-100 translate-x-0 scale-100"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-2xl animate-bounce">
            {notification.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wider text-amber-400 font-semibold">Achievement Unlocked!</p>
            <p className="mt-1 text-lg font-bold text-white">{notification.name}</p>
          </div>
          <button
            onClick={() => dismiss(notification.id)}
            className="shrink-0 rounded-full p-1 text-zinc-500 hover:text-white hover:bg-white/10 transition"
          >
            ✕
          </button>
        </div>
        {/* Progress bar for auto-dismiss */}
        <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full rounded-full bg-amber-500/50 animate-shrink" />
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-shrink {
          animation: shrink 5s linear forwards;
        }
      `}</style>
    </div>
  );
}