import { expectType } from 'ts-data-forge';
import type { Min } from 'ts-type-forge';

// embed-sample-code-ignore-above

type U = 2 | 5 | 1;

expectType<Min<U>, 1>('=');

expectType<Min<5>, 5>('=');

expectType<Min<0 | 10>, 0>('=');

expectType<Min<1000 | 1023>, 1000>('=');

// embed-sample-code-ignore-below
