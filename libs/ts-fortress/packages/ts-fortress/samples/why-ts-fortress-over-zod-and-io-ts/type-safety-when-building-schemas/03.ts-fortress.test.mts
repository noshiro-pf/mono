import * as t from 'ts-fortress';

// ❌ TypeScript error - this won't compile!
const SomeObjectIncorrect = t.record({
  // @ts-expect-error number is not assignable to Type<unknown>
  key1: 1,
  // @ts-expect-error string is not assignable to Type<unknown>
  key2: 'string',
});

// ✅ Correct ts-fortress usage - enforced by TypeScript
const SomeObject = t.record({
  key1: t.literal(1), // or t.number(1) with default
  key2: t.string(),
});

// embed-sample-code-ignore-below
export { SomeObject, SomeObjectIncorrect };
