import { type StrictPick } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Person = Readonly<{ name: string; age: number; email: string }>;
type BasicInfo = StrictPick<Person, 'name' | 'age'>; // { name: string; age: number }
// type Invalid = StrictPick<Person, 'name' | 'invalid'>; // Error: 'invalid' is not a key of Person

// embed-sample-code-ignore-below
export type { BasicInfo, Person };
