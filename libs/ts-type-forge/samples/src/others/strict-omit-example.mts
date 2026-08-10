import { type StrictOmit } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Person = Readonly<{ name: string; age: number; email: string }>;
type PublicInfo = StrictOmit<Person, 'email'>; // { name: string; age: number }
// type Invalid = StrictOmit<Person, 'email' | 'invalid'>; // Error: 'invalid' is not a key of Person

// embed-sample-code-ignore-below
export type { Person, PublicInfo };
