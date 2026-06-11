import { getLevelForXp, getStoredXp } from "@/lib/leveling";

export type SkillStatus = "locked" | "unlocked" | "mastered";

export type SkillNode = {
  id: string;
  name: string;
  icon: string;
  description: string;
  xpRequired: number;
  xpToMaster: number;
  category: string;
  dependencies: string[];
  row: number;
  column: number;
};

export type SkillProgress = {
  skillId: string;
  xp: number;
  status: SkillStatus;
  completions: number;
};

// ─── Skill Tree Definitions ──────────────────────────────────────

const SOFTWARE_ENGINEER_SKILLS: SkillNode[] = [
  {
    id: "algorithms",
    name: "Algorithms",
    icon: "🔢",
    description: "Sorting, searching, dynamic programming, and algorithmic problem-solving",
    xpRequired: 0,
    xpToMaster: 300,
    category: "Core CS",
    dependencies: [],
    row: 0,
    column: 1,
  },
  {
    id: "data-structures",
    name: "Data Structures",
    icon: "📊",
    description: "Arrays, linked lists, trees, graphs, hash tables, and heaps",
    xpRequired: 50,
    xpToMaster: 350,
    category: "Core CS",
    dependencies: ["algorithms"],
    row: 1,
    column: 0,
  },
  {
    id: "databases",
    name: "Databases",
    icon: "🗄️",
    description: "SQL, NoSQL, indexing, query optimization, and data modeling",
    xpRequired: 100,
    xpToMaster: 400,
    category: "Backend",
    dependencies: ["algorithms"],
    row: 1,
    column: 2,
  },
  {
    id: "networking",
    name: "Networking",
    icon: "🌐",
    description: "HTTP, TCP/IP, DNS, load balancing, and network protocols",
    xpRequired: 150,
    xpToMaster: 350,
    category: "Infrastructure",
    dependencies: ["data-structures"],
    row: 2,
    column: 0,
  },
  {
    id: "backend",
    name: "Backend",
    icon: "⚙️",
    description: "Server-side development, APIs, microservices, and middleware",
    xpRequired: 200,
    xpToMaster: 500,
    category: "Engineering",
    dependencies: ["databases", "data-structures"],
    row: 2,
    column: 2,
  },
  {
    id: "frontend",
    name: "Frontend",
    icon: "🎨",
    description: "UI engineering, React, state management, and web performance",
    xpRequired: 200,
    xpToMaster: 450,
    category: "Engineering",
    dependencies: ["data-structures"],
    row: 3,
    column: 0,
  },
  {
    id: "system-design",
    name: "System Design",
    icon: "🏗️",
    description: "Distributed architecture, scalability, caching, and trade-off analysis",
    xpRequired: 300,
    xpToMaster: 600,
    category: "Architecture",
    dependencies: ["backend", "networking"],
    row: 3,
    column: 2,
  },
  {
    id: "distributed-systems",
    name: "Distributed Systems",
    icon: "🌍",
    description: "Consensus, replication, partitioning, fault tolerance, and CAP theorem",
    xpRequired: 400,
    xpToMaster: 700,
    category: "Architecture",
    dependencies: ["system-design", "networking"],
    row: 4,
    column: 1,
  },
];

// ─── Career Skill Maps ───────────────────────────────────────────

const CAREER_SKILLS: Record<string, SkillNode[]> = {
  "software-engineer": SOFTWARE_ENGINEER_SKILLS,
  doctor: [
    {
      id: "diagnosis",
      name: "Diagnosis",
      icon: "🔍",
      description: "Clinical reasoning, differential diagnosis, and diagnostic procedures",
      xpRequired: 0,
      xpToMaster: 300,
      category: "Clinical",
      dependencies: [],
      row: 0, column: 1,
    },
    {
      id: "emergency",
      name: "Emergency Response",
      icon: "🚑",
      description: "Acute care, triage, trauma management, and emergency protocols",
      xpRequired: 100,
      xpToMaster: 400,
      category: "Clinical",
      dependencies: ["diagnosis"],
      row: 1, column: 1,
    },
    {
      id: "patient-care",
      name: "Patient Care",
      icon: "🤝",
      description: "Bedside manner, patient communication, and care coordination",
      xpRequired: 200,
      xpToMaster: 350,
      category: "Soft Skills",
      dependencies: ["diagnosis"],
      row: 2, column: 0,
    },
    {
      id: "medical-ethics",
      name: "Medical Ethics",
      icon: "⚖️",
      description: "Ethical dilemmas, informed consent, and professional conduct",
      xpRequired: 250,
      xpToMaster: 300,
      category: "Professional",
      dependencies: ["emergency", "patient-care"],
      row: 2, column: 2,
    },
  ],
  lawyer: [
    {
      id: "legal-reasoning",
      name: "Legal Reasoning",
      icon: "🧠",
      description: "Case analysis, legal research, and argumentation",
      xpRequired: 0, xpToMaster: 300, category: "Core", dependencies: [], row: 0, column: 1,
    },
    {
      id: "contracts",
      name: "Contracts",
      icon: "📝",
      description: "Contract drafting, review, and negotiation",
      xpRequired: 100, xpToMaster: 350, category: "Practice", dependencies: ["legal-reasoning"], row: 1, column: 0,
    },
    {
      id: "criminal-law",
      name: "Criminal Law",
      icon: "⚖️",
      description: "Criminal procedure, defense, and prosecution",
      xpRequired: 100, xpToMaster: 350, category: "Practice", dependencies: ["legal-reasoning"], row: 1, column: 2,
    },
    {
      id: "client-communication",
      name: "Client Communication",
      icon: "💬",
      description: "Client counseling, ethical obligations, and advocacy",
      xpRequired: 200, xpToMaster: 300, category: "Soft Skills", dependencies: ["contracts", "criminal-law"], row: 2, column: 1,
    },
  ],
  "investment-banker": [
    {
      id: "financial-modeling",
      name: "Financial Modeling",
      icon: "📊",
      description: "Valuation, DCF, LBO, and financial projections",
      xpRequired: 0, xpToMaster: 400, category: "Core", dependencies: [], row: 0, column: 1,
    },
    {
      id: "capital-markets",
      name: "Capital Markets",
      icon: "📈",
      description: "Equity, debt, IPO, and capital raising",
      xpRequired: 150, xpToMaster: 350, category: "Markets", dependencies: ["financial-modeling"], row: 1, column: 0,
    },
    {
      id: "mergers",
      name: "M&A",
      icon: "🤝",
      description: "Mergers, acquisitions, due diligence, and deal execution",
      xpRequired: 150, xpToMaster: 400, category: "Deals", dependencies: ["financial-modeling"], row: 1, column: 2,
    },
    {
      id: "client-management",
      name: "Client Management",
      icon: "💼",
      description: "Pitching, relationships, and stakeholder communication",
      xpRequired: 250, xpToMaster: 300, category: "Soft Skills", dependencies: ["capital-markets", "mergers"], row: 2, column: 1,
    },
  ],
  "product-manager": [
    {
      id: "product-strategy",
      name: "Product Strategy",
      icon: "🎯",
      description: "Vision, roadmap, and go-to-market strategy",
      xpRequired: 0, xpToMaster: 350, category: "Core", dependencies: [], row: 0, column: 1,
    },
    {
      id: "user-research",
      name: "User Research",
      icon: "🔬",
      description: "Customer insights, usability testing, and surveys",
      xpRequired: 100, xpToMaster: 300, category: "Research", dependencies: ["product-strategy"], row: 1, column: 0,
    },
    {
      id: "data-analysis",
      name: "Data Analysis",
      icon: "📉",
      description: "Metrics, A/B testing, and data-driven decisions",
      xpRequired: 100, xpToMaster: 350, category: "Analytics", dependencies: ["product-strategy"], row: 1, column: 2,
    },
    {
      id: "stakeholder-management",
      name: "Stakeholder Mgmt",
      icon: "🤝",
      description: "Cross-functional alignment, communication, and leadership",
      xpRequired: 200, xpToMaster: 350, category: "Leadership", dependencies: ["user-research", "data-analysis"], row: 2, column: 1,
    },
  ],
  "data-scientist": [
    {
      id: "machine-learning",
      name: "Machine Learning",
      icon: "🤖",
      description: "Model selection, training, evaluation, and deployment",
      xpRequired: 0, xpToMaster: 450, category: "Core", dependencies: [], row: 0, column: 1,
    },
    {
      id: "statistics",
      name: "Statistics",
      icon: "📐",
      description: "Hypothesis testing, probability, and experimentation",
      xpRequired: 100, xpToMaster: 350, category: "Math", dependencies: ["machine-learning"], row: 1, column: 0,
    },
    {
      id: "data-engineering",
      name: "Data Engineering",
      icon: "⚙️",
      description: "Pipelines, ETL, data warehousing, and big data",
      xpRequired: 150, xpToMaster: 400, category: "Infrastructure", dependencies: ["machine-learning"], row: 1, column: 2,
    },
    {
      id: "business-analytics",
      name: "Business Analytics",
      icon: "📊",
      description: "Insights, dashboards, and stakeholder communication",
      xpRequired: 200, xpToMaster: 300, category: "Communication", dependencies: ["statistics", "data-engineering"], row: 2, column: 1,
    },
  ],
};

// ─── Storage ─────────────────────────────────────────────────────

const SKILL_PROGRESS_KEY = "careerSimSkillProgress";

function getSkillStorage(): Record<string, SkillProgress[]> {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(SKILL_PROGRESS_KEY);
  if (!raw) return {};
  try { return JSON.parse(raw) as Record<string, SkillProgress[]>; } catch { return {}; }
}

function saveSkillStorage(data: Record<string, SkillProgress[]>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SKILL_PROGRESS_KEY, JSON.stringify(data));
}

// ─── Public API ──────────────────────────────────────────────────

export function getSkills(careerKey: string): SkillNode[] {
  return CAREER_SKILLS[careerKey] || [];
}

export function getSkillProgress(careerKey: string): SkillProgress[] {
  const storage = getSkillStorage();
  const skills = getSkills(careerKey);
  const saved = storage[careerKey] || [];
  const xp = getStoredXp();
  const level = getLevelForXp(xp).level;

  return skills.map((skill) => {
    const existing = saved.find((s) => s.skillId === skill.id);
    const savedXp = existing?.xp || 0;

    // Determine status
    let status: SkillStatus = "locked";

    // Unlock if dependencies are mastered OR enough level
    const depsMet = skill.dependencies.every((depId) => {
      const depSkill = saved.find((s) => s.skillId === depId);
      return depSkill?.status === "mastered" || (depSkill?.xp || 0) >= getThreshold(depId, careerKey);
    });

    const levelMet = level >= Math.ceil(skill.xpRequired / 100);

    if (savedXp >= skill.xpToMaster) {
      status = "mastered";
    } else if (existing?.status === "mastered") {
      status = "mastered";
    } else if (existing?.status === "unlocked" || depsMet || levelMet) {
      status = "unlocked";
    }

    return {
      skillId: skill.id,
      xp: savedXp,
      status,
      completions: existing?.completions || 0,
    };
  });
}

function getThreshold(skillId: string, careerKey: string): number {
  const skills = getSkills(careerKey);
  const skill = skills.find((s) => s.id === skillId);
  return skill ? Math.floor(skill.xpToMaster * 0.5) : 0;
}

export function addSkillXp(careerKey: string, skillId: string, amount: number): SkillProgress {
  const storage = getSkillStorage();
  const careerProgress = storage[careerKey] || [];
  let skill = careerProgress.find((s) => s.skillId === skillId);

  if (!skill) {
    skill = { skillId, xp: 0, status: "unlocked", completions: 0 };
    careerProgress.push(skill);
  }

  skill.xp += amount;
  skill.completions += 1;

  // Check mastery
  const skills = getSkills(careerKey);
  const node = skills.find((s) => s.id === skillId);
  if (node && skill.xp >= node.xpToMaster) {
    skill.status = "mastered";
  } else {
    skill.status = "unlocked";
  }

  storage[careerKey] = careerProgress;
  saveSkillStorage(storage);

  return skill;
}

export function getSkillXpForCategory(careerKey: string, category: string): number {
  const skills = getSkills(careerKey);
  const progress = getSkillProgress(careerKey);
  let total = 0;

  for (const skill of skills) {
    if (skill.category === category) {
      const prog = progress.find((p) => p.skillId === skill.id);
      total += prog?.xp || 0;
    }
  }

  return total;
}

export function getTotalSkillXp(careerKey: string): number {
  const progress = getSkillProgress(careerKey);
  return progress.reduce((sum, p) => sum + p.xp, 0);
}

export function getMasteredCount(careerKey: string): number {
  const progress = getSkillProgress(careerKey);
  return progress.filter((p) => p.status === "mastered").length;
}