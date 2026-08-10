import { type ToString } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Str = ToString<123>; // "123"
type Bool = ToString<boolean>; // boolean

// embed-sample-code-ignore-below
export type { Bool, Str };
