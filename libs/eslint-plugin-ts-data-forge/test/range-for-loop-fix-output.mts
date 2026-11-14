/**
 * What `prefer-range-for-loop` writes as a fix, compiled.
 *
 * The rule fixes a loop only when it takes the bounds for ones `range` accepts
 * — a `SafeInt`, or an integer literal from -512 to 511 — and it decides that
 * from the shape of their types, not by resolving `range`'s declaration (the
 * fix is usually what adds the import). This file is what holds the two
 * together: the loops below are the `output`s of the rule's tests
 * (`src/rules/prefer-range-for-loop.test.mts`), so `check:types` fails when
 * `range` stops accepting something the rule fixes, and the `@ts-expect-error`
 * lines fail when it starts accepting something the rule only suggests — the
 * width of the literal range above all, which is `range`'s own `MaxInt`. The
 * last group is neither: suggestions that compile, which the rule leaves to the
 * author for what their types do not say, and which fail here only when `range`
 * stops accepting them.
 *
 * The loops are copied here by hand: nothing checks that a new `output` of the
 * rule's tests is among them, so one left out is compiled nowhere. A suggestion
 * whose operand is an `any` is left out on purpose: an `any` compiles against
 * any parameter, so it would check nothing.
 */

import { range } from 'ts-data-forge';
import type {
  FiniteNumber,
  Int,
  NonZeroSafeInt,
  PositiveSafeInt,
  SafeInt,
  SafeUint,
  Uint32,
} from 'ts-type-forge';

const two = 2;

const begin = 5;

const end = 15;

declare const log: () => void;

export const fixed = (
  a: SafeInt,
  b: Uint32,
  c: SafeUint | 3,
  n: SafeUint,
  step: PositiveSafeInt,
): void => {
  for (const i of range(0, 10)) {
    console.log(i);
  }

  for (const i of range(0, 10, 2)) {
    console.log(i);
  }

  for (const i of range(-10, -5)) {
    console.log(i);
  }

  for (const i of range(-512, 511)) {
    console.log(i);
  }

  for (const i of range(-512, 511, 2)) {
    console.log(i);
  }

  for (const i of range(0, a)) {
    console.log(i);
  }

  for (const j of range(0, b)) {
    console.log(j);
  }

  for (const k of range(0, c)) {
    console.log(k);
  }

  for (const i of range(a, a)) {
    console.log(i);
  }

  for (const i of range(0, a, step)) {
    console.log(i);
  }

  for (const j of range(0, a, two)) {
    console.log(j);
  }

  for (const k of range(0, a, 511)) {
    console.log(k);
  }

  for (const i of range(0, n satisfies SafeUint)) {
    console.log(i);
  }

  for (const j of range(0, n as SafeInt)) {
    console.log(j);
  }

  for (const j of range(begin, end)) {
    console.log(j);
  }

  // The fixed output of a sequence begin, reproduced as the rule writes it.
  // eslint-disable-next-line no-sequences
  for (const i of range((log(), 0), a)) {
    console.log(i);
  }
};

type Tag = Readonly<{ tag: 'tag' }>;

/** A tagged literal fits as the literal it is a subset of. */
export const fixedTagged = (last: 10 & Tag, by: 2 & Tag): void => {
  for (const i of range(0, last, by)) {
    console.log(i);
  }
};

type LookAlikeSafeInt = number &
  Readonly<{ NaNValue: false; Finite: true; Int: true; SafeInt: true }>;

export const suggestedOnly = (
  n: number,
  i: Int,
  f: FiniteNumber,
  s: SafeInt,
  l: LookAlikeSafeInt,
): void => {
  // @ts-expect-error 512 is one past the small-integer literals `range` takes.
  for (const k of range(0, 512)) {
    console.log(k);
  }

  // @ts-expect-error -513 is one before them.
  for (const k of range(-513, 0)) {
    console.log(k);
  }

  // @ts-expect-error So is a step of 512.
  for (const k of range(0, 10, 512)) {
    console.log(k);
  }

  // prettier-ignore
  // @ts-expect-error `-(5)` is a `number`, unlike `-5`.
  for (const k of range(-(5), 0)) {
    console.log(k);
  }

  // @ts-expect-error A `number` is not a `SafeInt`.
  for (const k of range(0, n)) {
    console.log(k);
  }

  // @ts-expect-error Nor as a begin.
  for (const k of range(n, 10)) {
    console.log(k);
  }

  // @ts-expect-error An `Int` may be past the safe integers.
  for (const k of range(0, i)) {
    console.log(k);
  }

  // @ts-expect-error A `FiniteNumber` may not be an integer.
  for (const k of range(0, f)) {
    console.log(k);
  }

  // @ts-expect-error A `number` is not a `NonZeroSafeInt`.
  for (const k of range(0, s, n)) {
    console.log(k);
  }

  // A look-alike of the brand keys is not a `SafeInt`:
  // @ts-expect-error It lacks ts-type-forge's marker.
  for (const k of range(0, l)) {
    console.log(k);
  }

  // @ts-expect-error A `SafeInt` step may be zero.
  for (const k of range(0, s, s)) {
    console.log(k);
  }
};

/**
 * Suggestions that compile, which the rule leaves to the author all the same:
 * a step that may be negative, with which `range` would not stop where the loop
 * does, and a cast on a literal step, a layer `range` does not take.
 */
export const suggestedThoughCompiling = (
  n: SafeInt,
  s: NonZeroSafeInt,
): void => {
  for (const k of range(0, n, s)) {
    console.log(k);
  }

  // The suggestion keeps the cast the author wrote, as it is reproduced here.
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  for (const k of range(0, n, 600 as PositiveSafeInt)) {
    console.log(k);
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  for (const k of range(0, n, 600 as -1)) {
    console.log(k);
  }
};
