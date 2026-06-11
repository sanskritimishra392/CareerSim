export interface CareerStage {
  id: string;
  title: string;
  shortTitle: string;
  minLevel: number;
  maxLevel: number;
  description: string;
  requirements: string[];
  icon: string;
  color: string;
}

export const SOFTWARE_ENGINEER_ROADMAP: CareerStage[] = [
  {
    id: "intern",
    title: "Intern",
    shortTitle: "Intern",
    minLevel: 1,
    maxLevel: 2,
    description: "Learn the codebase, contribute small fixes, and develop strong collaboration habits.",
    requirements: [
      "Understand basic programming concepts and version control",
      "Write clean, readable code with guidance",
      "Participate in code reviews and team standups",
      "Complete small bug fixes and feature tasks",
    ],
    icon: "🌱",
    color: "emerald",
  },
  {
    id: "junior",
    title: "Junior Engineer",
    shortTitle: "Junior",
    minLevel: 3,
    maxLevel: 4,
    description: "Take ownership of small features, improve code quality, and build confidence in deliveries.",
    requirements: [
      "Ship features independently with minimal oversight",
      "Write unit tests and integration tests",
      "Understand the team's tech stack and architecture",
      "Contribute to technical discussions and planning",
    ],
    icon: "🪴",
    color: "teal",
  },
  {
    id: "engineer",
    title: "Software Engineer",
    shortTitle: "Engineer",
    minLevel: 5,
    maxLevel: 6,
    description: "Design larger systems, mentor peers, and lead more complex projects across the stack.",
    requirements: [
      "Design and implement moderate-to-complex features end-to-end",
      "Mentor junior engineers through code reviews and pairing",
      "Lead technical discussions and propose architecture decisions",
      "Understand production systems, monitoring, and incident response",
    ],
    icon: "🌿",
    color: "sky",
  },
  {
    id: "senior",
    title: "Senior Engineer",
    shortTitle: "Senior",
    minLevel: 7,
    maxLevel: 8,
    description: "Own technical direction, influence architecture, and drive cross-team initiatives.",
    requirements: [
      "Lead multi-quarter technical projects with cross-team impact",
      "Set coding standards and best practices for the organization",
      "Mentor multiple engineers and conduct technical interviews",
      "Drive incident retrospectives and system improvements",
    ],
    icon: "🌳",
    color: "indigo",
  },
  {
    id: "staff",
    title: "Staff Engineer",
    shortTitle: "Staff",
    minLevel: 9,
    maxLevel: 10,
    description: "Shape product strategy, influence org-wide technical decisions, and deliver high-impact outcomes.",
    requirements: [
      "Define technical strategy spanning multiple teams or orgs",
      "Unblock critical path items and resolve org-wide technical challenges",
      "Sponsor senior engineers and grow engineering leadership",
      "Represent the organization in cross-company technical forums",
    ],
    icon: "🏔️",
    color: "violet",
  },
  {
    id: "principal",
    title: "Principal Engineer",
    shortTitle: "Principal",
    minLevel: 11,
    maxLevel: Infinity,
    description: "Set company-wide technical vision, drive industry-level impact, and cultivate engineering culture.",
    requirements: [
      "Define the long-term technical vision for the entire engineering organization",
      "Drive company-wide architectural decisions and platform strategy",
      "Develop distinguished engineers and shape engineering culture",
      "Represent the company externally through publications and speaking",
    ],
    icon: "⭐",
    color: "amber",
  },
];

export type RoadmapId = "softwareEngineer";

export const ROADMAPS: Record<RoadmapId, CareerStage[]> = {
  softwareEngineer: SOFTWARE_ENGINEER_ROADMAP,
};

export function getStageForLevel(level: number, careerKey: RoadmapId = "softwareEngineer"): CareerStage | null {
  const stages = ROADMAPS[careerKey];
  if (!stages) return null;

  for (const stage of stages) {
    if (level >= stage.minLevel && level <= stage.maxLevel) {
      return stage;
    }
  }
  // If level exceeds all maxLevels, return the last stage
  return stages[stages.length - 1] ?? null;
}

export function getNextStage(stage: CareerStage | null, careerKey: RoadmapId = "softwareEngineer"): CareerStage | null {
  if (!stage) return null;
  const stages = ROADMAPS[careerKey];
  if (!stages) return null;

  const currentIndex = stages.findIndex((s) => s.id === stage.id);
  if (currentIndex === -1 || currentIndex >= stages.length - 1) return null;
  return stages[currentIndex + 1];
}

export function getProgressToNextStage(
  level: number,
  currentStage: CareerStage | null,
  nextStage: CareerStage | null
): number {
  if (!currentStage || !nextStage) return 1;

  const levelRange = nextStage.minLevel - currentStage.minLevel;
  const levelProgress = level - currentStage.minLevel;
  return Math.min(1, Math.max(0, levelProgress / levelRange));
}