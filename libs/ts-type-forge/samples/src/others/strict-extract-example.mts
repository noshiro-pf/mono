import { type StrictExtract } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Union = 'a' | 'b' | 'c';
type Extracted = StrictExtract<Union, 'a' | 'b'>; // 'a' | 'b'
// type Invalid = StrictExtract<Union, 'a' | 'd'>; // Error: 'd' is not assignable to Union

// embed-sample-code-ignore-below
export type { Extracted, Union };
