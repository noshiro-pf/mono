import { isRight } from 'fp-ts/Either';
import * as t from 'io-ts';

const T = t.keyof({
  0: undefined,
  1: undefined,
  2: undefined,
  3: undefined,
  4: undefined,
});

// ❌ Runtime behavior is inconsistent with TypeScript types!
assert.isFalse(isRight(T.decode(0))); // number 0 is rejected

assert.isTrue(isRight(T.decode('0'))); // string "0" is accepted

type T = t.TypeOf<typeof T>;
// ↑ TypeScript infers: 0 | 1 | 2 | 3 | 4 (number literals)
// But should be: "0" | "1" | "2" | "3" | "4" (string literals)

// The runtime validator only accepts strings, but TypeScript thinks it accepts numbers!

// embed-sample-code-ignore-below
// eslint-disable-next-line import-x/first
import { expectType } from 'ts-data-forge';

expectType<T, 0 | 1 | 2 | 3 | 4>('=');
