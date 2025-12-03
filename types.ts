export type AppView = 'ONBOARDING' | 'DASHBOARD' | 'DOCS' | 'PROMPTS';

export enum PersonalityTrait {
  EXECUTOR = "EXECUTOR",
  INFLUENCER = "INFLUENCER",
  RELATIONSHIP = "RELATIONSHIP",
  STRATEGIC = "STRATEGIC"
}

export interface UserProfile {
  name: string;
  strengthsRawText: string;
  topStrengths: string[];
}

export interface StrengthsConfig {
  id: string;
  userId?: string;
  strengthsRawText: string;
  topStrengths: string[];
  createdAt: number;
  updatedAt: number;
}

export enum TaskEnergy {
  DEEP_FOCUS = "Deep Focus",
  LIGHT_ADMIN = "Light/Admin",
  SOCIAL = "Social/Collaboration",
  REST = "Rest/Recharge"
}

export interface Task {
  id: string;
  title: string;
  description: string;
  sop: string;
  startTime: string;
  durationMinutes: number;
  energyType: TaskEnergy;
  rationale: string;
  isCompleted: boolean;
}

export interface DayPlan {
  id: string;
  goal: string;
  createdAt: number;
  tasks: Task[];
  energyDistribution: { name: string; value: number }[];
  journalNotes?: string; // For the integrated journaling feature
}

// Document Management Types
export type DocBlockType = 'text' | 'image_url' | 'link' | 'code';

export interface DocBlock {
  id: string;
  type: DocBlockType;
  content: string;
  label?: string;
}

export interface DocumentAsset {
  id: string;
  title: string;
  category: string;
  blocks: DocBlock[];
  lastModified: number;
}

// Prompt Management Types
export interface PromptItem {
  id: string;
  title: string;
  content: string;
  category: string;
  usageCount: number;
  tags: string[];
}
