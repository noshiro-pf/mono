export type AnswerId = string;

export const isAnswerId = (a: unknown): a is AnswerId => typeof a === 'string';

export type UserId = string | null;

export const isUserId = (a: unknown): a is UserId =>
  a === null || typeof a === 'string';

export type UserName = string;

export const isUserName = (a: unknown): a is UserName => typeof a === 'string';

export type Weight = number;

export const isWeight = (a: unknown): a is Weight => typeof a === 'number';
