import { type Database } from './database';

export type AnswerType = 'fair' | 'good' | 'poor';

export type DatabaseRef = Readonly<{ db: Database }>;
export type DatabaseMutRef = { db: Database };
