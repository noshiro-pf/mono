import { type Brand, type GetBrandValuePart } from 'ts-type-forge';

// embed-sample-code-ignore-above

type UserId = Brand<string, 'UserId'>;
type UserIdValue = GetBrandValuePart<UserId>; // string

type Age = Brand<number, 'Age' | 'positive'>;
type AgeValue = GetBrandValuePart<Age>; // number

// embed-sample-code-ignore-below
export type { Age, AgeValue, UserId, UserIdValue };
