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
// here is checked by all twelve TypeScript minors in both flavors.

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
