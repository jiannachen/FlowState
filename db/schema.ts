import { pgTable, text, timestamp, integer, jsonb, uuid } from 'drizzle-orm/pg-core';
import { DocBlock, Task, PromptItem, StrengthsConfig } from '../types';

// Users Table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Strengths Configuration Table
export const strengthsConfigs = pgTable('strengths_configs', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  strengthsRawText: text('strengths_raw_text').notNull(),
  topStrengths: jsonb('top_strengths').$type<string[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Plans Table (Goals & Tasks)
export const plans = pgTable('plans', {
  id: text('id').primaryKey(), // Using string ID to match Gemini generation or UUID
  userId: uuid('user_id').references(() => users.id),
  goal: text('goal').notNull(),
  tasks: jsonb('tasks').$type<Task[]>().notNull(),
  energyDistribution: jsonb('energy_distribution').$type<{name: string, value: number}[]>().notNull(),
  journalNotes: text('journal_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Documents Table
export const documents = pgTable('documents', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  title: text('title').notNull(),
  category: text('category').default('General'),
  blocks: jsonb('blocks').$type<DocBlock[]>().default([]),
  lastModified: timestamp('last_modified').defaultNow().notNull(),
});

// Prompts Table
export const prompts = pgTable('prompts', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').default('Uncategorized'),
  usageCount: integer('usage_count').default(0),
  tags: jsonb('tags').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
