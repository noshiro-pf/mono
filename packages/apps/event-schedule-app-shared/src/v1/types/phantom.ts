export type AnswerId = Brand<string, 'AnswerId'>;
// eslint-disable-next-line no-restricted-syntax
export const createAnswerId = (s: string): AnswerId => s as AnswerId;

export type UserName = Brand<string, 'UserName'>;
// eslint-disable-next-line no-restricted-syntax
export const createUserName = (s: string): UserName => s as UserName;

export type Weight = Brand<number, 'Weight'>;
// eslint-disable-next-line no-restricted-syntax
export const createWeight = (s: number): Weight => s as Weight;
