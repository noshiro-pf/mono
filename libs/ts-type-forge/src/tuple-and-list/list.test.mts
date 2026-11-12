import { expectType } from 'ts-data-forge';
import type { DeepReadonly } from '../record/index.mjs';
import type { Index } from '../type-level-integer/index.mjs';
import type { FixedLengthTuple } from './length-constrained-tuple.mjs';
import type { List } from './list.mjs';

// ── butlast ─────────────────────────
{
  expectType<List.ButLast<readonly []>, readonly []>('=');

  expectType<List.ButLast<readonly [1]>, readonly []>('=');

  expectType<List.ButLast<readonly [1, 2, 3]>, readonly [1, 2]>('=');

  // A tuple with a rest or an optional element may be shorter than its
  // positional elements suggest, so the result is an unsized array of its
  // elements, which every possible result satisfies.
  expectType<
    List.ButLast<readonly [1, 2, 3, ...(readonly number[])]>,
    readonly number[]
  >('=');

  expectType<List.ButLast<readonly [1, ...string[]]>, readonly (1 | string)[]>(
    '=',
  );

  expectType<readonly [], List.ButLast<readonly [1, ...string[]]>>('<=');

  expectType<List.ButLast<readonly [1, 2?]>, readonly (1 | 2 | undefined)[]>(
    '=',
  );

  expectType<readonly [], List.ButLast<readonly [1, 2?]>>('<=');

  expectType<List.ButLast<readonly string[]>, readonly string[]>('=');

  // Each member of a union keeps its own answer.
  expectType<
    List.ButLast<readonly [1, 2] | readonly string[]>,
    readonly [1] | readonly string[]
  >('=');
}

// ── concat ─────────────────────────
{
  expectType<List.Concat<readonly [], readonly []>, readonly []>('=');

  expectType<List.Concat<readonly [1, 2], readonly []>, readonly [1, 2]>('=');

  expectType<List.Concat<readonly [], readonly [1, 2]>, readonly [1, 2]>('=');

  // General (non-tuple) array operands (locks the documented behavior)
  expectType<
    List.Concat<readonly number[], readonly string[]>,
    readonly (number | string)[]
  >('=');

  expectType<
    List.Concat<readonly [1], readonly number[]>,
    readonly [1, ...number[]]
  >('=');

  expectType<
    List.Concat<readonly number[], readonly [1]>,
    readonly [...number[], 1]
  >('=');

  expectType<
    List.Concat<readonly [1, 2], readonly [3, 4, 5]>,
    readonly [1, 2, 3, 4, 5]
  >('=');
}

// ── flatten ─────────────────────────
{
  expectType<List.Flatten<DeepReadonly<[]>>, readonly []>('=');

  expectType<List.Flatten<DeepReadonly<[[]]>>, readonly []>('=');

  expectType<List.Flatten<DeepReadonly<[[1, 2], [], [3]]>>, readonly [1, 2, 3]>(
    '=',
  );

  expectType<List.Flatten<DeepReadonly<[[1, 2], [3]]>>, readonly [1, 2, 3]>(
    '=',
  );

  expectType<List.Flatten<DeepReadonly<[[1, 2], [3], []]>>, readonly [1, 2, 3]>(
    '=',
  );

  // General (non-tuple) array operands (locks the documented behavior)
  expectType<
    List.Flatten<readonly [readonly number[], readonly string[]]>,
    readonly (number | string)[]
  >('=');

  expectType<List.Flatten<readonly (readonly number[])[]>, readonly number[]>(
    '=',
  );

  expectType<
    List.Flatten<readonly [readonly [1], readonly number[]]>,
    readonly [1, ...number[]]
  >('=');

  expectType<List.Flatten<DeepReadonly<[[], [1, 2], [3]]>>, readonly [1, 2, 3]>(
    '=',
  );
}

// ── head ─────────────────────────
{
  expectType<List.Head<[]>, never>('=');

  // For a general (non-tuple) array, the element type is returned.
  expectType<List.Head<number[]>, number>('=');

  expectType<List.Head<[number, ...number[]], 0>, number>('=');

  // The default type `D` only applies to empty tuples, not general arrays.
  expectType<List.Head<number[], 1>, number>('=');

  expectType<List.Head<readonly []>, never>('=');

  expectType<List.Head<readonly number[]>, number>('=');

  expectType<List.Head<readonly [number, ...(readonly number[])], 0>, number>(
    '=',
  );

  expectType<List.Head<readonly number[], 1>, number>('=');

  // Additional tests
  expectType<List.Head<[1, 2, 3]>, 1>('=');

  expectType<List.Head<[], 'default'>, 'default'>('=');

  expectType<List.Head<[boolean, string, number]>, boolean>('=');

  expectType<List.Head<readonly string[]>, string>('=');

  expectType<List.Head<[42]>, 42>('=');
}

// ── last ─────────────────────────
{
  expectType<List.Last<[]>, never>('=');

  expectType<List.Last<[1]>, 1>('=');

  expectType<List.Last<[1, 2, 3]>, 3>('=');

  expectType<List.Last<readonly []>, never>('=');

  expectType<List.Last<readonly [1]>, 1>('=');

  expectType<List.Last<readonly [1, 2, 3]>, 3>('=');

  // Additional tests
  expectType<List.Last<[boolean, string, number]>, number>('=');

  expectType<List.Last<[42]>, 42>('=');

  // For a general (non-tuple) array, the element type is returned.
  expectType<List.Last<readonly string[]>, string>('=');

  // For a tuple with a trailing rest element, the exact last element is not
  // statically known, so the union of all element types is returned.
  expectType<List.Last<[1, 2, ...string[]]>, 1 | 2 | string>('=');

  expectType<List.Last<readonly [...string[], 1]>, 1>('=');
}

// ── partition ─────────────────────────
{
  expectType<List.Partition<1, readonly []>, readonly []>('=');

  expectType<
    List.Partition<2, readonly [1, 2, 3]>,
    readonly [readonly [1, 2], readonly [3]]
  >('=');

  expectType<
    List.Partition<3, readonly [1, 2, 3]>,
    readonly [readonly [1, 2, 3]]
  >('=');

  expectType<
    List.Partition<2, readonly [1, 2, 3, 4]>,
    readonly [readonly [1, 2], readonly [3, 4]]
  >('=');

  expectType<
    List.Partition<2, readonly string[]>,
    readonly (readonly string[])[]
  >('=');

  expectType<
    List.Partition<2, readonly [1, ...string[]]>,
    readonly (readonly (1 | string)[])[]
  >('=');

  expectType<
    List.Partition<1, readonly [1, 2?]>,
    readonly (readonly (1 | 2 | undefined)[])[]
  >('=');

  // A chunk size of 0 is `never`, whatever the input's shape.
  expectType<List.Partition<0, readonly string[]>, never>('=');

  expectType<List.Partition<0, readonly [1, ...string[]]>, never>('=');

  expectType<List.Partition<0, readonly [1, 2]>, never>('=');
}

// ── reverse ─────────────────────────
{
  expectType<List.Reverse<readonly []>, readonly []>('=');

  expectType<List.Reverse<[]>, readonly []>('=');

  expectType<List.Reverse<readonly [1]>, readonly [1]>('=');

  expectType<List.Reverse<readonly [1, 2, 3]>, readonly [3, 2, 1]>('=');

  expectType<List.Reverse<[1, 2, 3]>, readonly [3, 2, 1]>('=');

  expectType<List.Reverse<readonly number[]>, readonly number[]>('=');

  expectType<List.Reverse<readonly [1?]>, readonly (1 | undefined)[]>('=');

  expectType<
    List.Reverse<readonly [1, 2?]>,
    readonly [...(2 | undefined)[], 1]
  >('=');

  expectType<readonly [1], List.Reverse<readonly [1, 2?]>>('<=');

  expectType<
    List.Reverse<readonly [1, ...string[]]>,
    readonly [...string[], 1]
  >('=');

  expectType<
    List.Reverse<readonly [1, 2, ...(readonly number[])]>,
    readonly [...number[], 2, 1]
  >('=');
}

// ── set-at ─────────────────────────
{
  expectType<List.SetAt<2, 999, readonly []>, readonly []>('=');

  expectType<List.SetAt<2, 999, readonly [1, 2]>, readonly [1, 2]>('=');

  expectType<List.SetAt<1, 999, readonly [1, 2, 3]>, readonly [1, 999, 3]>('=');

  expectType<List.SetAt<0, 999, readonly [1, 2, 3]>, readonly [999, 2, 3]>('=');

  expectType<
    List.SetAt<0, 999, readonly [1, 2?]>,
    readonly (1 | 2 | 999 | undefined)[]
  >('=');

  expectType<
    List.SetAt<0, 999, readonly [1, 2] | readonly [3]>,
    readonly [999, 2] | readonly [999]
  >('=');
}

// ── skip-last ─────────────────────────
{
  expectType<List.SkipLast<0, readonly []>, readonly []>('=');

  expectType<List.SkipLast<1, readonly []>, readonly []>('=');

  expectType<List.SkipLast<0, readonly [1, 2, 3]>, readonly [1, 2, 3]>('=');

  expectType<List.SkipLast<1, readonly [1, 2, 3]>, readonly [1, 2]>('=');

  expectType<List.SkipLast<5, readonly [1, 2, 3]>, readonly []>('=');

  expectType<List.SkipLast<5, readonly number[]>, readonly number[]>('=');

  expectType<
    List.SkipLast<1, readonly [1, ...string[]]>,
    readonly (1 | string)[]
  >('=');

  expectType<readonly [], List.SkipLast<1, readonly [1, ...string[]]>>('<=');

  expectType<
    List.SkipLast<1, readonly [1, 2?]>,
    readonly (1 | 2 | undefined)[]
  >('=');

  expectType<readonly [1], List.SkipLast<1, readonly [1, 2?]>>('<=');

  expectType<
    List.SkipLast<1, readonly [1, 2] | readonly [3]>,
    readonly [1] | readonly []
  >('=');
}

// ── skip ─────────────────────────
{
  expectType<List.Skip<0, readonly []>, readonly []>('=');

  expectType<List.Skip<1, readonly []>, readonly []>('=');

  expectType<List.Skip<0, readonly [1, 2, 3]>, readonly [1, 2, 3]>('=');

  expectType<List.Skip<1, readonly [1, 2, 3]>, readonly [2, 3]>('=');

  expectType<List.Skip<5, readonly [1, 2, 3]>, readonly []>('=');

  expectType<List.Skip<5, readonly number[]>, readonly number[]>('=');

  expectType<List.Skip<2, readonly [1, ...string[]]>, readonly (1 | string)[]>(
    '=',
  );

  expectType<readonly [string], List.Skip<2, readonly [1, ...string[]]>>('<=');

  expectType<List.Skip<1, readonly [1?, 2?]>, readonly (1 | 2 | undefined)[]>(
    '=',
  );

  expectType<readonly [2], List.Skip<1, readonly [1?, 2?]>>('<=');

  expectType<
    List.Skip<1, readonly [1, 2] | readonly [3]>,
    readonly [2] | readonly []
  >('=');

  expectType<
    List.Skip<1, readonly [1, 2] | readonly [3, ...string[]]>,
    readonly [2] | readonly (3 | string)[]
  >('=');
}

// ── tail ─────────────────────────
{
  expectType<List.Tail<readonly []>, readonly []>('=');

  expectType<List.Tail<readonly [1]>, readonly []>('=');

  expectType<List.Tail<readonly [1, 2, 3]>, readonly [2, 3]>('=');

  expectType<
    List.Tail<readonly [1, 2, 3, ...(readonly number[])]>,
    readonly [2, 3, ...(readonly number[])]
  >('=');

  // A required first element is removed exactly, whatever follows it.
  expectType<List.Tail<readonly [1, ...string[]]>, readonly string[]>('=');

  expectType<List.Tail<readonly [1, 2?]>, readonly [(2 | undefined)?]>('=');

  expectType<List.Tail<readonly [...string[], 1]>, readonly (string | 1)[]>(
    '=',
  );

  expectType<readonly [], List.Tail<readonly [...string[], 1]>>('<=');

  expectType<List.Tail<readonly [1?, 2?]>, readonly (1 | 2 | undefined)[]>('=');

  expectType<readonly [2], List.Tail<readonly [1?, 2?]>>('<=');

  expectType<List.Tail<readonly string[]>, readonly string[]>('=');
}

// ── take-last ─────────────────────────
{
  expectType<List.TakeLast<2, readonly []>, readonly []>('=');

  expectType<List.TakeLast<2, readonly [1, 2]>, readonly [1, 2]>('=');

  expectType<List.TakeLast<2, readonly [1, 2, 3]>, readonly [2, 3]>('=');

  expectType<List.TakeLast<0, readonly [1, 2, 3]>, readonly []>('=');

  expectType<List.TakeLast<2, readonly number[]>, readonly number[]>('=');

  expectType<List.TakeLast<0, readonly number[]>, readonly number[]>('=');

  expectType<
    List.TakeLast<1, readonly [1, ...string[]]>,
    readonly (1 | string)[]
  >('=');

  expectType<readonly [string], List.TakeLast<1, readonly [1, ...string[]]>>(
    '<=',
  );

  expectType<
    List.TakeLast<1, readonly [1, 2?]>,
    readonly (1 | 2 | undefined)[]
  >('=');

  expectType<readonly [2], List.TakeLast<1, readonly [1, 2?]>>('<=');

  expectType<
    List.TakeLast<1, readonly [1, 2] | readonly [3]>,
    readonly [2] | readonly [3]
  >('=');
}

// ── take ─────────────────────────
{
  expectType<List.Take<2, readonly []>, readonly []>('=');

  expectType<List.Take<2, readonly [1, 2]>, readonly [1, 2]>('=');

  expectType<List.Take<2, readonly [1, 2, 3]>, readonly [1, 2]>('=');

  expectType<List.Take<0, readonly [1, 2, 3]>, readonly []>('=');

  expectType<List.Take<2, readonly number[]>, readonly number[]>('=');

  expectType<List.Take<0, readonly number[]>, readonly number[]>('=');

  expectType<List.Take<2, string[]>, string[]>('=');

  // An unsized array intersected with a brand is classed with the tuples that
  // have a rest element, and loses the brand.
  expectType<
    List.Take<1, readonly string[] & Readonly<{ brand: 'x' }>>,
    readonly string[]
  >('=');

  expectType<
    List.Tail<readonly string[] & Readonly<{ brand: 'x' }>>,
    readonly string[]
  >('=');

  expectType<
    List.Reverse<readonly string[] & Readonly<{ brand: 'x' }>>,
    readonly string[]
  >('=');

  expectType<
    List.ButLast<readonly string[] & Readonly<{ brand: 'x' }>>,
    readonly string[]
  >('=');

  expectType<
    List.Skip<1, readonly string[] & Readonly<{ brand: 'x' }>>,
    readonly string[]
  >('=');

  expectType<
    List.TakeLast<1, readonly string[] & Readonly<{ brand: 'x' }>>,
    readonly string[]
  >('=');

  expectType<
    List.SkipLast<1, readonly string[] & Readonly<{ brand: 'x' }>>,
    readonly string[]
  >('=');

  expectType<List.Take<2, any>, any>('=');

  expectType<List.Take<1, readonly [1?, 2?]>, readonly (1 | 2 | undefined)[]>(
    '=',
  );

  expectType<readonly [], List.Take<1, readonly [1?, 2?]>>('<=');

  expectType<List.Take<1, readonly [1, ...string[]]>, readonly (1 | string)[]>(
    '=',
  );

  expectType<
    List.Take<1, readonly [1, 2] | readonly [3, ...string[]]>,
    readonly [1] | readonly (3 | string)[]
  >('=');

  expectType<
    List.Take<1, readonly [1, 2] | readonly [3, 4, 5]>,
    readonly [1] | readonly [3]
  >('=');
}

// ── zip ─────────────────────────
{
  expectType<List.Zip<readonly [], readonly []>, readonly []>('=');

  expectType<List.Zip<readonly [1], readonly []>, readonly []>('=');

  expectType<List.Zip<readonly [], readonly [1]>, readonly []>('=');

  // <= かつ >= だが "=" だとエラーになってしまう
  expectType<
    List.Zip<FixedLengthTuple<32, 1>, FixedLengthTuple<32, 2>>,
    FixedLengthTuple<32, readonly [1, 2]>
  >('<=');

  expectType<
    FixedLengthTuple<32, readonly [1, 2]>,
    List.Zip<FixedLengthTuple<32, 1>, FixedLengthTuple<32, 2>>
  >('<=');

  // The one-sided branch recurses as deep as the both-sided one.
  expectType<
    List.Zip<FixedLengthTuple<32, 1>, readonly number[]>['length'],
    Index<33>
  >('=');

  expectType<
    List.Zip<readonly [1, 2, 3], readonly [4, 5]>,
    readonly [readonly [1, 4], readonly [2, 5]]
  >('=');

  expectType<
    List.Zip<readonly [number, number, number], readonly [string]>,
    readonly [readonly [number, string]]
  >('=');

  expectType<
    List.Zip<readonly [number], readonly [string, ...string[]]>,
    readonly [readonly [number, string]]
  >('=');

  // A side that may be shorter than the other's fixed prefix makes the pairs
  // past its own guaranteed length optional: zipping stops at the shorter
  // input, so they exist only when that side is long enough.
  expectType<
    List.Zip<readonly [number], readonly [...string[]]>,
    readonly [(readonly [number, string])?]
  >('=');

  expectType<
    List.Zip<readonly [1, 2], readonly string[]>,
    readonly [(readonly [1, string])?, (readonly [2, string])?]
  >('=');

  expectType<
    List.Zip<readonly number[], readonly ['a', 'b']>,
    readonly [(readonly [number, 'a'])?, (readonly [number, 'b'])?]
  >('=');

  expectType<
    List.Zip<readonly [1, 2], readonly [string, ...string[]]>,
    readonly [readonly [1, string], (readonly [2, string])?]
  >('=');

  expectType<
    List.Zip<readonly [string, ...string[]], readonly [1, 2]>,
    readonly [readonly [string, 1], (readonly [string, 2])?]
  >('=');

  expectType<
    List.Zip<readonly [1, ...number[]], readonly string[]>,
    readonly [(readonly [1, string])?, ...(readonly [number, string])[]]
  >('=');

  // An element after a rest counts toward the length: B has at least two
  // elements, so the second pair is required. Which of B's elements sits at the
  // second position is not known, so its type is B's element type.
  expectType<
    List.Zip<readonly [1, 2], readonly [string, ...string[], number]>,
    readonly [readonly [1, string], readonly [2, string | number]]
  >('=');

  // An optional element is stepped past: B has at most two elements, so there
  // is no third pair, and the second one is optional, not widened by
  // `undefined`.
  expectType<
    List.Zip<readonly [1, 2, 3], readonly [string, string?]>,
    readonly [readonly [1, string], (readonly [2, string])?]
  >('=');

  // A has at most two elements, so the result does not end in a rest.
  expectType<
    List.Zip<readonly [1, 2?], readonly string[]>,
    readonly [(readonly [1, string])?, (readonly [2, string])?]
  >('=');

  expectType<
    List.Zip<readonly [1?, 2?], readonly [string, string, string]>,
    readonly [(readonly [1, string])?, (readonly [2, string])?]
  >('=');

  expectType<
    List.Zip<readonly [...number[], 1, 2], readonly [string, string, string]>,
    readonly [
      readonly [number, string],
      readonly [number, string],
      (readonly [number, string])?,
    ]
  >('=');

  expectType<
    List.Zip<readonly [string, ...string[]], readonly [number, number, number]>,
    readonly [
      readonly [string, number],
      (readonly [string, number])?,
      (readonly [string, number])?,
    ]
  >('=');

  expectType<
    List.Zip<
      readonly [boolean, ...string[]],
      readonly [number, number, number]
    >,
    readonly [
      readonly [boolean, number],
      (readonly [string, number])?,
      (readonly [string, number])?,
    ]
  >('=');

  expectType<
    List.Zip<
      readonly [number, number, number, ...number[]],
      readonly [boolean, ...string[]]
    >,
    readonly [
      readonly [number, boolean],
      (readonly [number, string])?,
      (readonly [number, string])?,
      ...(readonly [number, string])[],
    ]
  >('=');

  expectType<
    List.Zip<
      readonly [boolean, ...string[]],
      readonly [number, number, number, ...number[]]
    >,
    readonly [
      readonly [boolean, number],
      (readonly [string, number])?,
      (readonly [string, number])?,
      ...(readonly [string, number])[],
    ]
  >('=');
}

// ── union and non-literal length/index arguments ─────────────────────────
/* `List` delegates to `Tuple` for a fixed-length input, so it inherits the
 * union handling; for a general array it already answered without consulting
 * the argument. */
{
  expectType<
    List.SetAt<0 | 2, 'x', readonly [1, 2, 3]>,
    readonly [1 | 'x', 2, 3 | 'x']
  >('=');

  expectType<
    List.SetAt<number, 'x', readonly [1, 2, 3]>,
    readonly [1 | 'x', 2 | 'x', 3 | 'x']
  >('=');

  expectType<
    List.SetAt<0 | 2, 'x', readonly number[]>,
    readonly (number | 'x')[]
  >('=');

  expectType<List.Take<1 | 2, readonly [1, 2, 3]>, readonly (1 | 2 | 3)[]>('=');

  expectType<List.Skip<1 | 2, readonly [1, 2, 3]>, readonly (1 | 2 | 3)[]>('=');

  expectType<List.Take<1 | 2, readonly number[]>, readonly number[]>('=');

  expectType<List.Take<number, readonly [1, 2, 3]>, readonly (1 | 2 | 3)[]>(
    '=',
  );
}
