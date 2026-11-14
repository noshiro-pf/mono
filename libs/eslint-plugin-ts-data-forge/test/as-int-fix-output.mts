/**
 * What `prefer-as-int` writes as a fix, compiled, and what it reports without
 * one.
 *
 * The rule writes `asInt(x)` only when `x` is typed as a number at every layer
 * of its type wrappers, and reports a cast only when the type it names is
 * ts-data-forge's. It decides both without reading the cast functions'
 * declarations (the fix is usually what adds the import). This file holds that
 * to the real functions: the calls in `fixed` are the `output`s of the rule's
 * tests about the operand's type (`src/rules/prefer-as-int.test.mts`), so
 * `check:types` fails when a cast function stops accepting something the rule
 * fixes, and the `@ts-expect-error` lines show why the rest get no fix, failing
 * when a cast function starts accepting one of them. `reassigned` holds a fixed
 * output whose later reassignment is a type error, pinned by `@ts-expect-error`:
 * the known limit its documentation states.
 *
 * The calls are copied here by hand: nothing checks that a new `output` of the
 * rule's tests is among them, until a harness compiles every fixed output of
 * the plugin's type-aware rules (#4150). An `any` operand is left out on
 * purpose: it compiles against any parameter, so it would check nothing; the
 * rule withholds the fix because `any` says nothing of the value.
 */

import { asInt, asSafeInt, asUint32 } from 'ts-data-forge';
import type { Int, SafeInt, Uint32 } from 'ts-type-forge';

export const fixed = <N extends number>(
  n: number,
  i: Int,
  union: 1 | 2 | SafeInt,
  constrained: N,
  tagged: N & Readonly<{ tag: 1 }>,
): readonly [Int, Int, Int, Int, Int, Uint32, SafeInt, Uint32, Int, Int, Int] =>
  [
    asInt(n),
    asInt(1),
    asInt(-1),
    asInt(1 satisfies number),
    asInt(-1 as number),
    asUint32('a'.length),
    asSafeInt(i),
    asUint32(n satisfies number),
    asInt(union),
    asInt(constrained),
    asInt(tagged),
  ] as const;

export const notFixed = <T, S extends `${number}`>(
  u: unknown,
  s: string,
  maybe: number | undefined,
  t: T,
  numeric: number | `${number}`,
  numericString: S,
): readonly Int[] =>
  [
    // @ts-expect-error `asInt` takes a number, not a numeric string
    asInt(numeric),
    // @ts-expect-error `asInt` takes a number, not a numeric string `S`
    asInt(numericString),
    // @ts-expect-error `asInt` takes a number, not any `T`
    asInt(t),
    // @ts-expect-error `asInt` takes a number, not an `unknown`
    asInt(u),
    // @ts-expect-error `asInt` takes a number, not a string
    asInt(s),
    // @ts-expect-error `asInt` takes a number, not `undefined`
    asInt(maybe),
    // @ts-expect-error the layer under the outer cast is `unknown`
    asInt(JSON.parse('1') as unknown),
  ] as const;

/**
 * The known limit stated at the fix in `prefer-as-int.mts`: `asInt(0)` is typed
 * `Int & 0`, so a `let` it initializes takes no other `Int` later. This is the
 * `output` of the rule's test of a cast that initializes a `let`.
 */
export const reassigned = (): Int => {
  let mut_i = asInt(0);

  // @ts-expect-error `mut_i` is typed `Int & 0`, not `Int`
  mut_i = asInt(mut_i + 1);

  return mut_i;
};

/** A local type of the same name, which the rule leaves alone. */
type LocalInt = number & Readonly<{ __localInt: true }>;

// @ts-expect-error `asInt` returns ts-data-forge's `Int`, not a local one
export const local: LocalInt = asInt(1);
