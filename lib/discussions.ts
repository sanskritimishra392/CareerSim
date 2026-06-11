export type CommentVote = "up" | "down" | null;

export type Comment = {
  id: string;
  scenarioId: string;
  parentId: string | null;
  author: string;
  authorLevel: number;
  authorXp: number;
  body: string;
  votes: number;
  userVote: CommentVote;
  replies: Comment[];
  createdAt: string;
  updatedAt: string;
};

export type DiscussionData = {
  scenarioId: string;
  comments: Comment[];
};

// ─── Storage ──────────────────────────────────────────────────────

const COMMENTS_KEY = "careerSimComments";
const VOTES_KEY = "careerSimVotes";

function getAllComments(): Record<string, Comment[]> {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(COMMENTS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, Comment[]>;
  } catch {
    return {};
  }
}

function saveAllComments(data: Record<string, Comment[]>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(data));
}

function getUserVotes(): Record<string, CommentVote> {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(VOTES_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, CommentVote>;
  } catch {
    return {};
  }
}

function saveUserVotes(votes: Record<string, CommentVote>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}

// ─── Profile helper ──────────────────────────────────────────────

function getProfileInfo(): { name: string; level: number; xp: number } {
  try {
    const profileRaw = localStorage.getItem("careerSimProfile");
    const xpRaw = localStorage.getItem("careerSimXp");
    const xp = xpRaw ? Number(xpRaw) : 0;
    const level = Math.floor(xp / 100) + 1;

    if (profileRaw) {
      const profile = JSON.parse(profileRaw);
      return {
        name: profile.displayName || "Player",
        level,
        xp,
      };
    }
    return { name: "Player", level, xp };
  } catch {
    return { name: "Player", level: 1, xp: 0 };
  }
}

// ─── CRUD Operations ─────────────────────────────────────────────

export function getComments(scenarioId: string): Comment[] {
  const all = getAllComments();
  const comments = all[scenarioId] || [];
  const votes = getUserVotes();

  // Attach user votes and sort
  return attachVotes(comments, votes).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function attachVotes(comments: Comment[], votes: Record<string, CommentVote>): Comment[] {
  return comments.map((c) => ({
    ...c,
    userVote: votes[c.id] || null,
    replies: c.replies ? attachVotes(c.replies, votes) : [],
  }));
}

export function addComment(scenarioId: string, body: string, parentId: string | null = null): Comment {
  const all = getAllComments();
  const comments = all[scenarioId] || [];
  const profile = getProfileInfo();

  const newComment: Comment = {
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    scenarioId,
    parentId,
    author: profile.name,
    authorLevel: profile.level,
    authorXp: profile.xp,
    body,
    votes: 0,
    userVote: null,
    replies: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (parentId) {
    // Add as reply to parent
    const updated = addReplyToComment(comments, parentId, newComment);
    all[scenarioId] = updated;
  } else {
    // Add as top-level comment
    comments.unshift(newComment);
    all[scenarioId] = comments;
  }

  saveAllComments(all);
  return newComment;
}

function addReplyToComment(comments: Comment[], parentId: string, reply: Comment): Comment[] {
  return comments.map((c) => {
    if (c.id === parentId) {
      return { ...c, replies: [...c.replies, reply] };
    }
    if (c.replies.length > 0) {
      return { ...c, replies: addReplyToComment(c.replies, parentId, reply) };
    }
    return c;
  });
}

export function voteComment(commentId: string, vote: CommentVote): void {
  const all = getAllComments();
  const votes = getUserVotes();
  const currentVote = votes[commentId] || null;

  let delta = 0;
  if (currentVote === vote) {
    // Toggle off
    votes[commentId] = null;
    delta = vote === "up" ? -1 : 1;
  } else {
    if (currentVote === "up") delta = -1;
    else if (currentVote === "down") delta = 1;
    votes[commentId] = vote;
    delta += vote === "up" ? 1 : -1;
  }

  saveUserVotes(votes);

  // Update vote count in all scenarios
  for (const scenarioId of Object.keys(all)) {
    all[scenarioId] = updateVoteInComments(all[scenarioId], commentId, delta);
  }
  saveAllComments(all);
}

function updateVoteInComments(comments: Comment[], commentId: string, delta: number): Comment[] {
  return comments.map((c) => {
    if (c.id === commentId) {
      return { ...c, votes: c.votes + delta };
    }
    if (c.replies.length > 0) {
      return { ...c, replies: updateVoteInComments(c.replies, commentId, delta) };
    }
    return c;
  });
}

export function deleteComment(commentId: string): void {
  const all = getAllComments();
  for (const scenarioId of Object.keys(all)) {
    all[scenarioId] = removeCommentFromList(all[scenarioId], commentId);
  }
  saveAllComments(all);
}

function removeCommentFromList(comments: Comment[], commentId: string): Comment[] {
  return comments
    .filter((c) => c.id !== commentId)
    .map((c) => ({
      ...c,
      replies: c.replies ? removeCommentFromList(c.replies, commentId) : [],
    }));
}

export function editComment(commentId: string, newBody: string): void {
  const all = getAllComments();
  for (const scenarioId of Object.keys(all)) {
    all[scenarioId] = editInComments(all[scenarioId], commentId, newBody);
  }
  saveAllComments(all);
}

function editInComments(comments: Comment[], commentId: string, newBody: string): Comment[] {
  return comments.map((c) => {
    if (c.id === commentId) {
      return { ...c, body: newBody, updatedAt: new Date().toISOString() };
    }
    if (c.replies.length > 0) {
      return { ...c, replies: editInComments(c.replies, commentId, newBody) };
    }
    return c;
  });
}

export function getCommentCount(scenarioId: string): number {
  const comments = getComments(scenarioId);
  let count = comments.length;
  for (const c of comments) {
    count += c.replies.length;
  }
  return count;
}