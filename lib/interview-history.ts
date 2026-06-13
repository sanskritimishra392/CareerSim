export interface InterviewRecord {
  id: string;
  scenarioTitle: string;
  category: string;
  difficulty: string;
  careerKey: string;
  date: string;
  scores: {
    relevance: number;
    clarity: number;
    reasoning: number;
  };
  averageScore: number;
  scorePercentage?: number;
  passed?: boolean;
  xpEarned: number;
}

const STORAGE_KEY = "careerSimInterviewHistory";

export function getInterviewHistory(): InterviewRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as InterviewRecord[];
  } catch {
    return [];
  }
}

export function addInterviewRecord(record: Omit<InterviewRecord, "id" | "date" | "averageScore">) {
  const history = getInterviewHistory();
  const avg = (record.scores.relevance + record.scores.clarity + record.scores.reasoning) / 3;

  const newRecord: InterviewRecord = {
    ...record,
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    date: new Date().toISOString(),
    averageScore: Math.round(avg * 10) / 10,
  };

  history.push(newRecord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return newRecord;
}

export function clearInterviewHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

export type HistoryFilter = {
  category?: string;
  difficulty?: string;
  dateRange?: "all" | "7d" | "30d" | "90d";
};

export function getFilteredHistory(filter: HistoryFilter): InterviewRecord[] {
  let history = getInterviewHistory();

  if (filter.category && filter.category !== "all") {
    history = history.filter((r) => r.category === filter.category);
  }
  if (filter.difficulty && filter.difficulty !== "all") {
    history = history.filter((r) => r.difficulty === filter.difficulty);
  }
  if (filter.dateRange && filter.dateRange !== "all") {
    const now = Date.now();
    const msMap = { "7d": 7 * 86400000, "30d": 30 * 86400000, "90d": 90 * 86400000 };
    const cutoff = now - (msMap[filter.dateRange] ?? 0);
    history = history.filter((r) => new Date(r.date).getTime() >= cutoff);
  }

  return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getScoreTrends(history: InterviewRecord[]): {
  labels: string[];
  scores: number[];
  average: number;
  trend: "up" | "down" | "stable";
} {
  const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const labels = sorted.map((r) => {
    const d = new Date(r.date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });
  const scores = sorted.map((r) => r.averageScore);
  const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  // Determine trend by comparing first half vs second half
  let trend: "up" | "down" | "stable" = "stable";
  if (scores.length >= 4) {
    const mid = Math.floor(scores.length / 2);
    const firstHalf = scores.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
    const secondHalf = scores.slice(mid).reduce((a, b) => a + b, 0) / (scores.length - mid);
    if (secondHalf - firstHalf > 0.5) trend = "up";
    else if (firstHalf - secondHalf > 0.5) trend = "down";
  }

  return { labels, scores, average: Math.round(average * 10) / 10, trend };
}

export function getUniqueCategories(): string[] {
  const history = getInterviewHistory();
  return [...new Set(history.map((r) => r.category))].sort();
}