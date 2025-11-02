import * as t from 'ts-fortress';

// ✅ ts-fortress: Runtime and types always match
const T = t.keyof(
  t.record({
    0: t.undefinedType,
    1: t.undefinedType,
    2: t.undefinedType,
    3: t.undefinedType,
    4: t.undefinedType,
  }),
);

type T = t.TypeOf<typeof T>;
// ↑ TypeScript correctly infers: "0" | "1" | "2" | "3" | "4" (string literals)

// ✅ Runtime behavior matches TypeScript types exactly
assert(t.Result.isErr(T.validate(0))); // ❌ Fails correctly - number 0 is rejected
assert(t.Result.isOk(T.validate('0'))); // ✅ Success - string "0" is accepted

// For this use case, if you want to define a union type of numeric literals, you can use `uintRange` from ts-fortress:

const U = t.uintRange({ start: 0, end: 5 });

type U = t.TypeOf<typeof U>;
// ↑ TypeScript correctly infers: 0 | 1 | 2 | 3 | 4 (number literals)

assert(t.Result.isErr(U.validate('0'))); // ❌ Fails - string "0" is rejected
assert(t.Result.isOk(U.validate(0))); // ✅ Success - number 0 is accepted

// embed-sample-code-ignore-below
// eslint-disable-next-line import-x/first
import { expectType } from 'ts-data-forge';

expectType<T, '0' | '1' | '2' | '3' | '4'>('=');
expectType<U, 0 | 1 | 2 | 3 | 4>('=');
