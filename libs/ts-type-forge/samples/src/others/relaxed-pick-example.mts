import { type RelaxedPick } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Person = Readonly<{ name: string; age: number; email: string }>;
type BasicInfo = RelaxedPick<Person, 'name' | 'age' | 'invalid'>; // { name: string; age: number }
type Empty = RelaxedPick<Person, 'nonexistent'>; // {}

// embed-sample-code-ignore-below
export type { BasicInfo, Empty, Person };
