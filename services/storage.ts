import { UserProfile, DayPlan, DocumentAsset, PromptItem, StrengthsConfig } from '../types';
import { db } from '../db/client';
import { users, plans, documents, prompts, strengthsConfigs } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * STORAGE SERVICE - DATABASE IMPLEMENTATION
 *
 * This service now uses PostgreSQL via Drizzle ORM for persistent data storage.
 * All data is stored in Neon Postgres database.
 */

const USE_DATABASE = db !== null;

if (!USE_DATABASE) {
  console.warn('⚠️ Database not available. Falling back to localStorage.');
}

const KEYS = {
  USER: 'flowstate_user',
  PLANS: 'flowstate_plans',
  DOCS: 'flowstate_docs',
  PROMPTS: 'flowstate_prompts',
  STRENGTHS_CONFIG: 'flowstate_strengths_config'
};

// --- USER PROFILE ---

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  if (USE_DATABASE && db) {
    try {
      // Check if user exists
      const existingUsers = await db.select().from(users).limit(1);

      if (existingUsers.length > 0) {
        // Update existing user
        await db.update(users)
          .set({
            name: profile.name,
            strengthsRawText: profile.strengthsRawText,
            topStrengths: profile.topStrengths
          })
          .where(eq(users.id, existingUsers[0].id));
      } else {
        // Insert new user
        await db.insert(users).values({
          name: profile.name,
          strengthsRawText: profile.strengthsRawText,
          topStrengths: profile.topStrengths
        });
      }
      return;
    } catch (error) {
      console.error('Database error, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  localStorage.setItem(KEYS.USER, JSON.stringify(profile));
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  if (USE_DATABASE && db) {
    try {
      const result = await db.select().from(users).limit(1);
      if (result.length > 0) {
        const user = result[0];
        return {
          name: user.name,
          strengthsRawText: user.strengthsRawText || '',
          topStrengths: user.topStrengths as string[]
        };
      }
      return null;
    } catch (error) {
      console.error('Database error, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  const data = localStorage.getItem(KEYS.USER);
  return data ? JSON.parse(data) : null;
};

// --- PLANS & TASKS ---

export const savePlans = async (plansList: DayPlan[]): Promise<void> => {
  if (USE_DATABASE && db) {
    try {
      // Get current user
      const userList = await db.select().from(users).limit(1);
      if (userList.length === 0) {
        console.warn('No user found, cannot save plans');
        return;
      }
      const userId = userList[0].id;

      // Delete all existing plans and re-insert
      // (Simple approach - in production you'd do proper upsert)
      await db.delete(plans);

      for (const plan of plansList) {
        await db.insert(plans).values({
          id: plan.id,
          userId: userId,
          goal: plan.goal,
          tasks: plan.tasks,
          energyDistribution: plan.energyDistribution,
          journalNotes: plan.journalNotes || null,
          createdAt: new Date(plan.createdAt),
          updatedAt: new Date()
        });
      }
      return;
    } catch (error) {
      console.error('Database error, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  localStorage.setItem(KEYS.PLANS, JSON.stringify(plansList));
};

export const getPlans = async (): Promise<DayPlan[]> => {
  if (USE_DATABASE && db) {
    try {
      const result = await db.select().from(plans).orderBy(plans.createdAt);
      return result.map(p => ({
        id: p.id,
        goal: p.goal,
        createdAt: p.createdAt.getTime(),
        tasks: p.tasks as any,
        energyDistribution: p.energyDistribution as any,
        journalNotes: p.journalNotes || undefined
      }));
    } catch (error) {
      console.error('Database error, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  const data = localStorage.getItem(KEYS.PLANS);
  return data ? JSON.parse(data) : [];
};

// --- DOCUMENTS ---

export const saveDocs = async (docsList: DocumentAsset[]): Promise<void> => {
  if (USE_DATABASE && db) {
    try {
      const userList = await db.select().from(users).limit(1);
      if (userList.length === 0) {
        console.warn('No user found, cannot save docs');
        return;
      }
      const userId = userList[0].id;

      await db.delete(documents);

      for (const doc of docsList) {
        await db.insert(documents).values({
          id: doc.id,
          userId: userId,
          title: doc.title,
          category: doc.category,
          blocks: doc.blocks,
          lastModified: new Date(doc.lastModified)
        });
      }
      return;
    } catch (error) {
      console.error('Database error, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  localStorage.setItem(KEYS.DOCS, JSON.stringify(docsList));
};

export const getDocs = async (): Promise<DocumentAsset[]> => {
  if (USE_DATABASE && db) {
    try {
      const result = await db.select().from(documents).orderBy(documents.lastModified);

      if (result.length === 0) {
        // Return seed data if empty
        return getDefaultDocs();
      }

      return result.map(d => ({
        id: d.id,
        title: d.title,
        category: d.category || 'General',
        blocks: d.blocks as any,
        lastModified: d.lastModified.getTime()
      }));
    } catch (error) {
      console.error('Database error, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  const data = localStorage.getItem(KEYS.DOCS);
  if (data) return JSON.parse(data);

  return getDefaultDocs();
};

const getDefaultDocs = (): DocumentAsset[] => [{
  id: '1',
  title: 'Product Launch Materials',
  category: 'Marketing',
  lastModified: Date.now(),
  blocks: [
    { id: 'b1', type: 'text', content: 'Introducing FlowState: The first AI planner that understands your psychology.', label: 'Hero Headline' },
    { id: 'b2', type: 'link', content: 'https://flowstate.app/demo-video', label: 'Demo Video URL' }
  ]
}];

// --- PROMPTS ---

export const savePrompts = async (promptsList: PromptItem[]): Promise<void> => {
  if (USE_DATABASE && db) {
    try {
      const userList = await db.select().from(users).limit(1);
      if (userList.length === 0) {
        console.warn('No user found, cannot save prompts');
        return;
      }
      const userId = userList[0].id;

      await db.delete(prompts);

      for (const prompt of promptsList) {
        await db.insert(prompts).values({
          id: prompt.id,
          userId: userId,
          title: prompt.title,
          content: prompt.content,
          category: prompt.category,
          usageCount: prompt.usageCount,
          tags: prompt.tags,
          createdAt: new Date()
        });
      }
      return;
    } catch (error) {
      console.error('Database error, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  localStorage.setItem(KEYS.PROMPTS, JSON.stringify(promptsList));
};

export const getPrompts = async (): Promise<PromptItem[]> => {
  if (USE_DATABASE && db) {
    try {
      const result = await db.select().from(prompts).orderBy(prompts.createdAt);

      if (result.length === 0) {
        return getDefaultPrompts();
      }

      return result.map(p => ({
        id: p.id,
        title: p.title,
        content: p.content,
        category: p.category || 'Uncategorized',
        usageCount: p.usageCount || 0,
        tags: p.tags as string[]
      }));
    } catch (error) {
      console.error('Database error, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  const data = localStorage.getItem(KEYS.PROMPTS);
  if (data) return JSON.parse(data);

  return getDefaultPrompts();
};

const getDefaultPrompts = (): PromptItem[] => [
  { id: '1', title: 'Professional Email Rewriter', content: 'Rewrite this email to be more professional, concise, and empathetic: [Paste Text]', category: 'Communication', usageCount: 12, tags: ['Email', 'Work'] },
  { id: '2', title: 'Code Refactor', content: 'Refactor this code to follow Clean Code principles and add comments explaining complex logic.', category: 'Coding', usageCount: 45, tags: ['Dev'] },
  { id: '3', title: 'Meeting Summary', content: 'Summarize these meeting notes into: Key Decisions, Action Items, and Next Steps.', category: 'Admin', usageCount: 8, tags: ['Meeting'] }
];

// --- STRENGTHS CONFIGURATION ---

export const saveStrengthsConfig = async (config: StrengthsConfig): Promise<void> => {
  if (USE_DATABASE && db) {
    try {
      const userList = await db.select().from(users).limit(1);
      if (userList.length === 0) {
        console.warn('No user found, cannot save strengths config');
        return;
      }
      const userId = userList[0].id;

      // Check if config exists
      const existing = await db.select().from(strengthsConfigs).limit(1);

      if (existing.length > 0) {
        // Update existing config
        await db.update(strengthsConfigs)
          .set({
            strengthsRawText: config.strengthsRawText,
            topStrengths: config.topStrengths,
            updatedAt: new Date(config.updatedAt)
          })
          .where(eq(strengthsConfigs.id, existing[0].id));
      } else {
        // Insert new config
        await db.insert(strengthsConfigs).values({
          id: config.id,
          userId: userId,
          strengthsRawText: config.strengthsRawText,
          topStrengths: config.topStrengths,
          createdAt: new Date(config.createdAt),
          updatedAt: new Date(config.updatedAt)
        });
      }
      return;
    } catch (error) {
      console.error('Database error, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  localStorage.setItem(KEYS.STRENGTHS_CONFIG, JSON.stringify(config));
};

export const getStrengthsConfig = async (): Promise<StrengthsConfig | null> => {
  if (USE_DATABASE && db) {
    try {
      const result = await db.select().from(strengthsConfigs).limit(1);
      if (result.length > 0) {
        const config = result[0];
        return {
          id: config.id,
          strengthsRawText: config.strengthsRawText,
          topStrengths: config.topStrengths as string[],
          createdAt: config.createdAt.getTime(),
          updatedAt: config.updatedAt.getTime()
        };
      }
      return null;
    } catch (error) {
      console.error('Database error, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  const data = localStorage.getItem(KEYS.STRENGTHS_CONFIG);
  return data ? JSON.parse(data) : null;
};

