export type AnswerId = Brand<string, 'AnswerId'>;

export const createAnswerId = (s: string): AnswerId =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  s as AnswerId;

export type UserName = Brand<string, 'UserName'>;

export const createUserName = (s: string): UserName =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  s as UserName;

export type Weight = Brand<number, 'Weight'>;

export const createWeight = (s: number): Weight =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  s as Weight;
