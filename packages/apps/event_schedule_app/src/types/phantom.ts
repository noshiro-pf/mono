import { Phantomic } from '@mono/ts-utils';

export type AnswerId = Phantomic<string, 'AnswerId'>;
export const answerId = (s: string): AnswerId => s as AnswerId;

export type UserName = Phantomic<string, 'UserName'>;
export const userName = (s: string): UserName => s as UserName;
