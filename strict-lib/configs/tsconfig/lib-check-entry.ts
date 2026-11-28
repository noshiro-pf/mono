// Entry point for the generated-lib type-check (see tsconfig.lib-check*.json).
//
// It carries no application code: with `skipLibCheck: false`, tsc fully checks
// the libReplacement-substituted strict lib `.d.ts` that make up the program,
// which is most of what this check is for. What it does carry is the handful of
// assertions below — declarations whose *use* went wrong while the declarations
// themselves compiled, so nothing here could have caught them.
//
// Every harness's `tsconfig.lib-check.json` and
// `tsconfig.lib-check.webworker.json` name this file, so one assertion added
// here is checked by all twelve TypeScript minors in both flavors. One that
// holds only from TypeScript 5.4 on goes in `lib-check-entry.since-5.4.ts`, and
// one that holds only from 5.8 on in `lib-check-entry.since-5.8.ts`.

import type { Int16, TypeEq, UnknownRecord } from 'ts-type-forge';

/**
 * #1840 — `ReturnType<typeof setTimeout>` came out `unknown`.
 *
 * `ReturnType` and `InstanceType` used to spell their conditional's `extends`
 * clause `(...args: readonly never[])`. An overload set whose last member is
 * *generic*, with a rest parameter computed from its own type parameter, does
 * not match that — so the conditional took its false branch and produced
 * `unknown`. Silently: a false branch is a type, not an error. The clause is
 * `StrictLibInternals.AnyArguments` now, which is a bare `never`.
 *
 * `setTimeout` is exactly that shape once `@types/node` merges its
 * `setTimeout<TArgs extends any[]>(cb, ms?, ...args:
 * MakeVoidParameterOptional<TArgs>)` with the DOM's. `@types/node` is not
 * available here (`types: []`), so the shape is restated below.
 */
declare function setTimeoutLike(
  handler: string | Function,
  timeout?: number,
  ...args: readonly unknown[]
): number;

declare function setTimeoutLike<TArgs extends any[]>(
  callback: (...args: TArgs) => void,
  delay?: number,
  ...args: Partial<TArgs>
): TimerLikeHandle;

type TimerLikeHandle = {
  readonly __brand: 'TimerLikeHandle';
};

// Fails with `Type 'unknown' is not assignable to type 'TimerLikeHandle'` if
// the conditional stops resolving.
export const timerHandle: TimerLikeHandle = undefined as unknown as ReturnType<
  typeof setTimeoutLike
>;

/**
 * #1841 — the trailing arguments of a replacement callback are the captured
 * groups, so they are typed `string | undefined` rather than `unknown`. With
 * `unknown` every caller had to narrow with `isString` before using a group
 * that the pattern shows can never be absent, and the narrowing never failed.
 *
 * The parameter is annotated rather than left to contextual typing: a template
 * literal accepts an `unknown` too, so an unannotated callback would go on
 * compiling if the declaration reverted.
 */
export const replaced = (subject: string): string =>
  subject
    .replace(
      /(\d+)/g,
      (_match, digits: string | undefined) => `<${digits ?? ''}>`,
    )
    .replaceAll(
      /(\d+)/g,
      (_match, digits: string | undefined) => `<${digits ?? ''}>`,
    );

/**
 * A global that a window and a worker both have is a property of
 * `typeof globalThis`; any other global is not.
 *
 * The converter turns `declare var` into `declare const` so that assigning to a
 * global is an error, and a `const` is not a property of `typeof globalThis`.
 * The names `lib.dom` and `lib.webworker` both declare are kept `var`, because
 * `globalThis.X` is the one spelling of them that works where there is no
 * `window` (a worker, Node.js). Both halves are asserted, in both flavors.
 */
export const sharedGlobals: readonly object[] = [
  globalThis.navigator,
  globalThis.location,
  globalThis.crypto,
  globalThis.Response,
];

// @ts-expect-error `NaN` is `const`; `Number.NaN` reaches it everywhere.
export const notOnGlobalThis: number = globalThis.NaN;

/**
 * #2586 — an entry of `Object.entries` on a record with optional keys could be
 * `undefined`, so `for (const [key, value] of …)` did not compile.
 *
 * `ToObjectEntries` indexes a mapped type over `keyof R`, and that mapped type
 * lacked `-?`: each optional key stayed optional, and indexing it added
 * `undefined` to the entry itself. The value of an optional key may still be
 * `undefined`, which the second assertion holds, so that a fix which strips
 * optionality from `R` as well fails here.
 */
export const optionalKeyEntries = (
  record: Readonly<{ a?: number; b?: string }>,
): readonly string[] => {
  const mut_lines: string[] = [];

  for (const [key, value] of Object.entries(record)) {
    mut_lines.push(`${key}=${String(value)}`);
  }

  return mut_lines;
};

export const optionalKeyValues = (
  record: Readonly<{ a?: number; b?: string }>,
): readonly (number | string)[] =>
  // @ts-expect-error The value of an optional key may be `undefined`.
  Object.entries(record).map(([, value]) => value);

/**
 * #2585 — `union` / `symmetricDifference` of two sets of a literal union came
 * out `ReadonlySet<string>`.
 *
 * `ReadonlySetLike#has` takes the widened literal type, as `ReadonlySet#has`
 * does. A method parameter is bivariant, so inferring `U` in
 * `union<U>(other: ReadonlySetLike<U>)` took that parameter as a candidate next
 * to `keys()`'s and widened `U`. The parameter is under `NoInfer` now.
 *
 * TS 5.0–5.4 have no Set methods, so there `WithSetMethods` adds stand-ins and
 * the assertion holds trivially. It is a call rather than a conditional type,
 * because inferring from a generic method in a conditional type erases its type
 * parameter to `unknown` whether or not the declaration is right.
 */
type WithSetMethods<S> =
  S extends Readonly<{
    union: unknown;
    symmetricDifference: unknown;
  }>
    ? S
    : S &
        Readonly<{
          union: (other: S) => S;
          symmetricDifference: (other: S) => S;
        }>;

type Letter = 'a' | 'b';

declare const letters: WithSetMethods<ReadonlySet<Letter>>;

export const unionOfLetters: ReadonlySet<Letter> = letters.union(letters);

export const symmetricDifferenceOfLetters: ReadonlySet<Letter> =
  letters.symmetricDifference(letters);

/**
 * #3515 — the plain flavor's generic `abs` took any `number` and returned
 * `AbsoluteValue<N>`, which rewrites only a number literal, so a ts-type-forge
 * brand came back unchanged: `Math.abs` of an `Int16` was an `Int16`, although
 * `Math.abs(-32768)` is `32768`. The generic overload takes a `SmallInt` now,
 * as in the branded flavor, and any other argument gets a plain `number`.
 */
declare const int16: Int16;

// @ts-expect-error `Math.abs(-32768)` is `32768`, outside `Int16`.
export const absOfInt16: Int16 = Math.abs(int16);

export const absOfSmallLiteral: 3 = Math.abs(-3);

/**
 * #4015 — `Object.keys` and `Object.hasOwn` took only what `UnknownRecord`
 * accepts, so a value typed by an `interface` without a string index signature,
 * a class instance, an array, a `Map`, and an `object` — what `typeof u ===
 * 'object' && u !== null` narrows `unknown` to — did not compile.
 *
 * `Object.keys` takes any object now and gives the keys of a type
 * `UnknownRecord` accepts, `string` for any other, in one signature, so that
 * `records.map(Object.keys)` keeps the keys too. A primitive is still refused.
 *
 * `Object.hasOwn` takes any object too, and its type predicate narrows only
 * where it returns `true`: returning `false` says only that there is no *own*
 * property, which no type can tell from an inherited one or from one a type
 * leaves out, so where it returns `false` nothing is removed. It narrows only
 * for one literal key that no member of the object's type declares as
 * required; a required key, a union of keys, a `string` key and a union of
 * shapes told apart by a key narrow nothing either way.
 */
interface WithOptionalKey {
  a: number;
  b?: string;
}

class Counter {
  readonly count = 1;
}

declare const withOptionalKey: WithOptionalKey;

declare const someObject: object;

declare const xy: Readonly<{ x: 1; y: 2 }>;

declare const records: readonly Readonly<{ x: 1; y: 2 }>[];

const keysOfInterface = Object.keys(withOptionalKey);

const keysOfObject = Object.keys(someObject);

const keysOfArray = Object.keys([1, 2]);

const keysOfInstance = Object.keys(new Counter());

const keysOfMap = Object.keys(new Map<string, number>());

const keysOfRecord = Object.keys(xy);

// Point-free: the one signature is what TypeScript reads here.
const keysOfRecords = records.map(Object.keys);

export const objectKeysTypes = [
  true satisfies TypeEq<typeof keysOfInterface, string[]>,
  true satisfies TypeEq<typeof keysOfObject, string[]>,
  true satisfies TypeEq<typeof keysOfArray, string[]>,
  true satisfies TypeEq<typeof keysOfInstance, string[]>,
  true satisfies TypeEq<typeof keysOfMap, string[]>,
  true satisfies TypeEq<typeof keysOfRecord, ('x' | 'y' | (string & {}))[]>,
  true satisfies TypeEq<typeof keysOfRecords, ('x' | 'y' | (string & {}))[][]>,
] as const;

// In a generic function the result is an array of the condition, which
// TypeScript resolves only for a type argument; its elements are strings either
// way.
export const keysOfGeneric = <T extends UnknownRecord>(
  record: T,
): readonly string[] => Object.keys(record);

export const keysOfGenericAreUnresolved = <T extends UnknownRecord>(
  record: T,
): readonly StrictLibInternals.ToObjectKeys<T>[] => {
  // @ts-expect-error Not `ToObjectKeys<T>[]` until `T` is known.
  return Object.keys(record);
};

// @ts-expect-error A number is not an object.
export const keysOfNumber = Object.keys(1);

// @ts-expect-error A string is not an object.
export const keysOfString = Object.keys('s');

// @ts-expect-error `undefined` is not an object.
export const keysOfUndefined = Object.keys(undefined);

type WithX = { x: number };

type WithOptionalA = { a?: number };

type WithA = { a: number };

type WithB = { b: string };

export const hasOwnNarrowsWhereTrue = (
  u: unknown,
  dict: Readonly<Record<string, number>>,
  withX: WithX,
  withOptionalA: WithOptionalA,
  withOptionalAOrB: WithOptionalA | WithB,
): void => {
  if (typeof u === 'object' && u !== null && Object.hasOwn(u, 'a')) {
    true satisfies TypeEq<typeof u, object & { a: unknown }>;
  }

  if (Object.hasOwn(dict, 'a')) {
    true satisfies TypeEq<typeof dict.a, number>;
  } else {
    true satisfies TypeEq<typeof dict, Readonly<Record<string, number>>>;
  }

  // A value of `WithX` may hold more properties than `WithX` names.
  if (Object.hasOwn(withX, 'y')) {
    true satisfies TypeEq<typeof withX, WithX & { y: unknown }>;
  } else {
    true satisfies TypeEq<typeof withX, WithX>;
  }

  // `{}` is a `WithOptionalA`, and has no own `a`.
  if (Object.hasOwn(withOptionalA, 'a')) {
    true satisfies TypeEq<typeof withOptionalA.a, number | undefined>;
  } else {
    true satisfies TypeEq<typeof withOptionalA, WithOptionalA>;
  }

  if (Object.hasOwn(withOptionalKey, 'b')) {
    true satisfies TypeEq<typeof withOptionalKey.b, string | undefined>;
  } else {
    true satisfies TypeEq<typeof withOptionalKey, WithOptionalKey>;
  }

  if (!Object.hasOwn(withOptionalAOrB, 'a')) {
    true satisfies TypeEq<typeof withOptionalAOrB, WithOptionalA | WithB>;
  }
};

export const hasOwnNarrowsNothing = (
  withX: WithX,
  withAOrB: WithA | WithB,
  key: string,
  xOrY: 'x' | 'y',
): void => {
  // A class instance whose `x` is a getter is a `WithX`, and has no own `x`.
  if (Object.hasOwn(withX, 'x')) {
    true satisfies TypeEq<typeof withX, WithX>;
  } else {
    true satisfies TypeEq<typeof withX, WithX>;
  }

  // Tell such a union apart by a discriminant property, or with a type guard
  // written for the union.
  if (Object.hasOwn(withAOrB, 'a')) {
    true satisfies TypeEq<typeof withAOrB, WithA | WithB>;
  } else {
    true satisfies TypeEq<typeof withAOrB, WithA | WithB>;
  }

  if (Object.hasOwn(withX, key)) {
    true satisfies TypeEq<typeof withX, WithX>;
  } else {
    true satisfies TypeEq<typeof withX, WithX>;
  }

  if (Object.hasOwn(withX, xOrY)) {
    true satisfies TypeEq<typeof withX, WithX>;
  } else {
    true satisfies TypeEq<typeof withX, WithX>;
  }
};

export const hasOwnOfOtherObjects: readonly boolean[] = [
  Object.hasOwn(someObject, 'a'),
  Object.hasOwn(new Counter(), 'count'),
  Object.hasOwn([1, 2], 0),
  Object.hasOwn(new Map<string, number>(), 'size'),
];

// @ts-expect-error A number is not an object.
export const hasOwnOfNumber = Object.hasOwn(1, 'a');
