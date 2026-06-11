"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getComments,
  addComment,
  voteComment,
  deleteComment,
  editComment,
  getCommentCount,
  type Comment,
  type CommentVote,
} from "@/lib/discussions";
import { getLevelForXp, getStoredXp } from "@/lib/leveling";
import { getReputationRank } from "@/lib/ranks";

interface Props {
  scenarioId: string;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function CommentVoteArrows({
  comment,
  onVote,
}: {
  comment: Comment;
  onVote: (id: string, vote: CommentVote) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[32px]">
      <button
        onClick={() => onVote(comment.id, "up")}
        className={`text-sm leading-none transition ${
          comment.userVote === "up" ? "text-orange-400" : "text-zinc-600 hover:text-zinc-300"
        }`}
      >
        ▲
      </button>
      <span
        className={`text-xs font-bold leading-none ${
          comment.votes > 0
            ? "text-orange-400"
            : comment.votes < 0
            ? "text-blue-400"
            : "text-zinc-500"
        }`}
      >
        {comment.votes}
      </span>
      <button
        onClick={() => onVote(comment.id, "down")}
        className={`text-sm leading-none transition ${
          comment.userVote === "down" ? "text-blue-400" : "text-zinc-600 hover:text-zinc-300"
        }`}
      >
        ▼
      </button>
    </div>
  );
}

function CommentCard({
  comment,
  onVote,
  onReply,
  onDelete,
  onEdit,
  depth = 0,
}: {
  comment: Comment;
  onVote: (id: string, vote: CommentVote) => void;
  onReply: (parentId: string, body: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, body: string) => void;
  depth: number;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);

  const [rankIcon, setRankIcon] = useState("🥉");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setRankIcon(getReputationRank().icon);
    }
  }, []);

  const profileName = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("careerSimProfile") || "{}")?.displayName || "Player"
    : "Player";

  const isAuthor = comment.author === profileName;

  const handleReply = () => {
    if (!replyBody.trim()) return;
    onReply(comment.id, replyBody.trim());
    setReplyBody("");
    setShowReply(false);
  };

  const handleEdit = () => {
    if (!editBody.trim()) return;
    onEdit(comment.id, editBody.trim());
    setEditing(false);
  };

  return (
    <div className={`${depth > 0 ? "ml-6 sm:ml-8 border-l-2 border-zinc-800 pl-3 sm:pl-4" : ""}`}>
      <div className="flex gap-2 py-3 group">
        {/* Vote arrows */}
        <CommentVoteArrows comment={comment} onVote={onVote} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Author info */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{comment.author}</span>
            <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
              Lvl {comment.authorLevel}
            </span>
            <span className="text-xs">{rankIcon}</span>
            <span className="text-xs text-zinc-600">{timeAgo(comment.createdAt)}</span>
            {comment.createdAt !== comment.updatedAt && (
              <span className="text-[10px] text-zinc-700">(edited)</span>
            )}
          </div>

          {/* Body */}
          {editing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-zinc-950 p-3 text-sm text-zinc-200 focus:border-sky-400/50 focus:outline-none"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="rounded-full bg-sky-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-sky-400"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-full border border-white/10 bg-zinc-800 px-4 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm leading-6 text-zinc-300 whitespace-pre-wrap">{comment.body}</p>
          )}

          {/* Actions */}
          {!editing && (
            <div className="mt-1.5 flex items-center gap-3">
              <button
                onClick={() => setShowReply(!showReply)}
                className="text-xs font-medium text-zinc-500 hover:text-zinc-300 transition"
              >
                Reply
              </button>
              {isAuthor && (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-xs font-medium text-zinc-500 hover:text-zinc-300 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="text-xs font-medium text-red-600 hover:text-red-400 transition"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}

          {/* Reply input */}
          {showReply && (
            <div className="mt-3 space-y-2">
              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Write your reply..."
                className="w-full rounded-lg border border-white/10 bg-zinc-950 p-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-sky-400/50 focus:outline-none"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReply}
                  disabled={!replyBody.trim()}
                  className="rounded-full bg-sky-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-50"
                >
                  Reply
                </button>
                <button
                  onClick={() => setShowReply(false)}
                  className="rounded-full border border-white/10 bg-zinc-800 px-4 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              onVote={onVote}
              onReply={onReply}
              onDelete={onDelete}
              onEdit={onEdit}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DiscussionSection({ scenarioId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "top">("newest");
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(() => {
    const all = getComments(scenarioId);
    const sorted = [...all].sort((a, b) => {
      if (sortBy === "top") return b.votes - a.votes;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setComments(sorted);
  }, [scenarioId, sortBy]);

  useEffect(() => {
    setMounted(true);
    refresh();
  }, [refresh]);

  const handlePostComment = () => {
    if (!newComment.trim()) return;
    addComment(scenarioId, newComment.trim());
    setNewComment("");
    refresh();
  };

  const handleVote = (commentId: string, vote: CommentVote) => {
    voteComment(commentId, vote);
    refresh();
  };

  const handleReply = (parentId: string, body: string) => {
    addComment(scenarioId, body, parentId);
    refresh();
  };

  const handleDelete = (commentId: string) => {
    deleteComment(commentId);
    refresh();
  };

  const handleEdit = (commentId: string, body: string) => {
    editComment(commentId, body);
    refresh();
  };

  const totalComments = comments.reduce((acc, c) => acc + 1 + c.replies.length, 0);

  if (!mounted) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-400 border-t-transparent mx-auto" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Discussion</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {totalComments} comment{totalComments !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSortBy("newest")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              sortBy === "newest"
                ? "bg-sky-500/20 text-sky-300"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => setSortBy("top")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              sortBy === "top"
                ? "bg-sky-500/20 text-sky-300"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Top
          </button>
        </div>
      </div>

      {/* New comment input */}
      <div className="mb-6 space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your approach, ask a question, or start a discussion..."
          className="w-full rounded-xl border border-white/10 bg-zinc-950/80 p-4 text-sm leading-7 text-zinc-200 placeholder-zinc-600 focus:border-sky-400/50 focus:outline-none"
          rows={3}
        />
        <div className="flex justify-end">
          <button
            onClick={handlePostComment}
            disabled={!newComment.trim()}
            className="inline-flex items-center rounded-full bg-sky-500 px-6 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Post Comment
          </button>
        </div>
      </div>

      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="divide-y divide-white/5">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onVote={handleVote}
              onReply={handleReply}
              onDelete={handleDelete}
              onEdit={handleEdit}
              depth={0}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-zinc-950/50 p-8 text-center">
          <p className="text-lg mb-2">💬</p>
          <p className="text-sm text-zinc-500">No comments yet. Be the first to share your approach!</p>
        </div>
      )}
    </div>
  );
}