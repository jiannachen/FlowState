import { UserProfile, DayPlan, DocumentAsset, PromptItem } from '../types';

/**
 * STORAGE SERVICE
 * 
 * In a real Next.js production environment, these functions would call your API endpoints
 * which then use the Drizzle DB client defined in `db/client.ts`.
 * 
 * For this client-side demo, we persist to LocalStorage so you can see it working immediately.
 */

const KEYS = {
  USER: 'flowstate_user',
  PLANS: 'flowstate_plans',
  DOCS: 'flowstate_docs',
  PROMPTS: 'flowstate_prompts'
};

// --- USER PROFILE ---

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  // DB Implementation: await db.insert(users).values(profile)...
  localStorage.setItem(KEYS.USER, JSON.stringify(profile));
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  // DB Implementation: await db.query.users.findFirst()...
  const data = localStorage.getItem(KEYS.USER);
  return data ? JSON.parse(data) : null;
};

// --- PLANS & TASKS ---

export const savePlans = async (plans: DayPlan[]): Promise<void> => {
  // DB Implementation: Upsert logic using Drizzle
  localStorage.setItem(KEYS.PLANS, JSON.stringify(plans));
};

export const getPlans = async (): Promise<DayPlan[]> => {
  const data = localStorage.getItem(KEYS.PLANS);
  return data ? JSON.parse(data) : [];
};

// --- DOCUMENTS ---

export const saveDocs = async (docs: DocumentAsset[]): Promise<void> => {
  localStorage.setItem(KEYS.DOCS, JSON.stringify(docs));
};

export const getDocs = async (): Promise<DocumentAsset[]> => {
  const data = localStorage.getItem(KEYS.DOCS);
  if (data) return JSON.parse(data);
  
  // Default Seed Data if empty
  return [{
    id: '1',
    title: 'Product Launch Materials',
    category: 'Marketing',
    lastModified: Date.now(),
    blocks: [
      { id: 'b1', type: 'text', content: 'Introducing FlowState: The first AI planner that understands your psychology.', label: 'Hero Headline' },
      { id: 'b2', type: 'link', content: 'https://flowstate.app/demo-video', label: 'Demo Video URL' }
    ]
  }];
};

// --- PROMPTS ---

export const savePrompts = async (prompts: PromptItem[]): Promise<void> => {
  localStorage.setItem(KEYS.PROMPTS, JSON.stringify(prompts));
};

export const getPrompts = async (): Promise<PromptItem[]> => {
  const data = localStorage.getItem(KEYS.PROMPTS);
  if (data) return JSON.parse(data);

  // Default Seed Data
  return [
    { id: '1', title: 'Professional Email Rewriter', content: 'Rewrite this email to be more professional, concise, and empathetic: [Paste Text]', category: 'Communication', usageCount: 12, tags: ['Email', 'Work'] },
    { id: '2', title: 'Code Refactor', content: 'Refactor this code to follow Clean Code principles and add comments explaining complex logic.', category: 'Coding', usageCount: 45, tags: ['Dev'] },
    { id: '3', title: 'Meeting Summary', content: 'Summarize these meeting notes into: Key Decisions, Action Items, and Next Steps.', category: 'Admin', usageCount: 8, tags: ['Meeting'] }
  ];
};
