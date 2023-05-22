export type AnswerId = Brand<string, 'AnswerId'>;
export const createAnswerId = (s: string): AnswerId => s as AnswerId;

export type UserName = Brand<string, 'UserName'>;
export const createUserName = (s: string): UserName => s as UserName;

export type Weight = Brand<number, 'Weight'>;
export const createWeight = (s: number): Weight => s as Weight;
