import type * as Psql from 'pg';
import { type psqlRowType } from '../constants';
import { type Database } from './database';

export type AnswerType = 'fair' | 'good' | 'poor';

export type DatabaseRef = Readonly<{ db: Database }>;
export type DatabaseMutRef = { db: Database };

export type PsqlRow = {
  [psqlRowType.id]: string;
  [psqlRowType.data]: JSONType;
  [psqlRowType.updated_at]: string;
};

export type PsqlClient = DeepReadonly<Psql.Client>;
