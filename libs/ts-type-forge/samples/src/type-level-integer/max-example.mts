import { expectType } from 'ts-data-forge';
import type { Max, Uint10 } from 'ts-type-forge';

// embed-sample-code-ignore-above

type U2 = 0 | 1 | 2;

expectType<Max<U2>, 2>('=');

expectType<Max<5>, 5>('=');

expectType<Max<Uint10>, 1023>('=');

// embed-sample-code-ignore-below
