import { type RelaxedOmit } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Person = { name: string; age: number; email: string };
type PublicInfo = RelaxedOmit<Person, 'email' | 'invalid'>; // { name: string; age: number }
type Same = RelaxedOmit<Person, 'nonexistent'>; // { name: string; age: number; email: string }

// embed-sample-code-ignore-below
export type { Person, PublicInfo, Same };
