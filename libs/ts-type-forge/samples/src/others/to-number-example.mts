import { type ToNumber } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Num = ToNumber<'456'>; // 456

// embed-sample-code-ignore-below
export type { Num };
