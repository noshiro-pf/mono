/* eslint-disable @typescript-eslint/no-generated-empty-object-type -- `Empty` is shown resolving to `{}` */
import { type RelaxedPick } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Person = { name: string; age: number; email: string };
type BasicInfo = RelaxedPick<Person, 'name' | 'age' | 'invalid'>; // { name: string; age: number }
type Empty = RelaxedPick<Person, 'nonexistent'>; // {}

// embed-sample-code-ignore-below
export type { BasicInfo, Empty, Person };
