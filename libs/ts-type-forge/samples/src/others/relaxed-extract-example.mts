import { type RelaxedExtract } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Union = 'a' | 'b' | 'c';
type Extracted = RelaxedExtract<Union, 'a' | 'd'>; // 'a'
type Numbers = RelaxedExtract<string | number | boolean, number>; // number

// embed-sample-code-ignore-below
export type { Extracted, Numbers, Union };
