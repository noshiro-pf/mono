import { type Database } from './database.mjs';

export type AnswerType = 'fair' | 'good' | 'poor';

export type DatabaseRef = Readonly<{ db: Database }>;
export type DatabaseMutRef = { db: Database };
