import type { Phantomic } from '@noshiro/ts-utils';

export type AnswerId = Phantomic<string, 'AnswerId'>;
export const createAnswerId = (s: string): AnswerId => s as AnswerId;

export type UserName = Phantomic<string, 'UserName'>;
export const createUserName = (s: string): UserName => s as UserName;

export type Weight = Phantomic<number, 'Weight'>;
export const createWeight = (s: number): Weight => s as Weight;
