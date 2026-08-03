import { expectType } from 'ts-data-forge';
import { type DeepReadonly } from '../record/index.mjs';
import { type FixedLengthTuple } from './length-constrained-tuple.mjs';
import { type Tuple } from './tuple.mjs';

// ── butlast ─────────────────────────
{
  expectType<Tuple.ButLast<readonly []>, readonly []>('=');

  expectType<Tuple.ButLast<readonly [1]>, readonly []>('=');

  expectType<Tuple.ButLast<readonly [1, 2, 3]>, readonly [1, 2]>('=');
}

// ── concat ─────────────────────────
{
  expectType<Tuple.Concat<readonly [], readonly []>, readonly []>('=');

  expectType<Tuple.Concat<readonly [1, 2], readonly []>, readonly [1, 2]>('=');

  expectType<Tuple.Concat<readonly [], readonly [1, 2]>, readonly [1, 2]>('=');

  expectType<
    Tuple.Concat<readonly [1, 2], readonly [3, 4, 5]>,
    readonly [1, 2, 3, 4, 5]
  >('=');
}

// ── flatten ─────────────────────────
{
  expectType<Tuple.Flatten<DeepReadonly<[]>>, readonly []>('=');

  expectType<Tuple.Flatten<DeepReadonly<[[]]>>, readonly []>('=');

  expectType<
    Tuple.Flatten<DeepReadonly<[[1, 2], [], [3]]>>,
    readonly [1, 2, 3]
  >('=');

  expectType<Tuple.Flatten<DeepReadonly<[[1, 2], [3]]>>, readonly [1, 2, 3]>(
    '=',
  );

  expectType<
    Tuple.Flatten<DeepReadonly<[[1, 2], [3], []]>>,
    readonly [1, 2, 3]
  >('=');

  expectType<
    Tuple.Flatten<DeepReadonly<[[], [1, 2], [3]]>>,
    readonly [1, 2, 3]
  >('=');
}

// ── head ─────────────────────────
{
  expectType<Tuple.Head<[]>, never>('=');

  expectType<Tuple.Head<[1]>, 1>('=');

  expectType<Tuple.Head<[1, 2], 0>, 1>('=');

  expectType<Tuple.Head<[], 1>, 1>('=');

  expectType<Tuple.Head<readonly []>, never>('=');

  expectType<Tuple.Head<readonly [1]>, 1>('=');

  expectType<Tuple.Head<readonly [1, 2], 0>, 1>('=');

  expectType<Tuple.Head<readonly [], 1>, 1>('=');

  // Additional tests
  expectType<Tuple.Head<[1, 2, 3]>, 1>('=');

  expectType<Tuple.Head<[], 'default'>, 'default'>('=');

  expectType<Tuple.Head<[boolean, string, number]>, boolean>('=');

  expectType<Tuple.Head<[42]>, 42>('=');

  expectType<Tuple.Head<[string, number, boolean]>, string>('=');
}

// ── last ─────────────────────────
{
  expectType<Tuple.Last<[]>, never>('=');

  expectType<Tuple.Last<[1]>, 1>('=');

  expectType<Tuple.Last<[1, 2, 3]>, 3>('=');

  expectType<Tuple.Last<readonly []>, never>('=');

  expectType<Tuple.Last<readonly [1]>, 1>('=');

  expectType<Tuple.Last<readonly [1, 2, 3]>, 3>('=');
}

// ── partition ─────────────────────────
{
  expectType<Tuple.Partition<1, readonly []>, readonly []>('=');

  expectType<
    Tuple.Partition<2, readonly [1, 2, 3]>,
    readonly [readonly [1, 2], readonly [3]]
  >('=');

  expectType<
    Tuple.Partition<3, readonly [1, 2, 3]>,
    readonly [readonly [1, 2, 3]]
  >('=');

  expectType<
    Tuple.Partition<2, readonly [1, 2, 3, 4]>,
    readonly [readonly [1, 2], readonly [3, 4]]
  >('=');
}

// ── reverse ─────────────────────────
{
  expectType<Tuple.Reverse<readonly []>, readonly []>('=');

  expectType<Tuple.Reverse<readonly [1]>, readonly [1]>('=');

  expectType<Tuple.Reverse<readonly [1, 2, 3]>, readonly [3, 2, 1]>('=');
}

// ── set-at ─────────────────────────
{
  expectType<Tuple.SetAt<2, 999, readonly []>, readonly []>('=');

  expectType<Tuple.SetAt<2, 999, readonly [1, 2]>, readonly [1, 2]>('=');

  expectType<Tuple.SetAt<1, 999, readonly [1, 2, 3]>, readonly [1, 999, 3]>(
    '=',
  );

  expectType<Tuple.SetAt<0, 999, readonly [1, 2, 3]>, readonly [999, 2, 3]>(
    '=',
  );
}

// ── skip-last ─────────────────────────
{
  expectType<Tuple.SkipLast<0, readonly []>, readonly []>('=');

  expectType<Tuple.SkipLast<1, readonly []>, readonly []>('=');

  expectType<Tuple.SkipLast<0, readonly [1, 2, 3]>, readonly [1, 2, 3]>('=');

  expectType<Tuple.SkipLast<1, readonly [1, 2, 3]>, readonly [1, 2]>('=');

  expectType<Tuple.SkipLast<5, readonly [1, 2, 3]>, readonly []>('=');
}

// ── skip ─────────────────────────
{
  expectType<Tuple.Skip<0, readonly []>, readonly []>('=');

  expectType<Tuple.Skip<1, readonly []>, readonly []>('=');

  expectType<Tuple.Skip<0, readonly [1, 2, 3]>, readonly [1, 2, 3]>('=');

  expectType<Tuple.Skip<1, readonly [1, 2, 3]>, readonly [2, 3]>('=');

  expectType<Tuple.Skip<5, readonly [1, 2, 3]>, readonly []>('=');
}

// ── tail ─────────────────────────
{
  expectType<Tuple.Tail<readonly []>, readonly []>('=');

  expectType<Tuple.Tail<readonly [1]>, readonly []>('=');

  expectType<Tuple.Tail<readonly [1, 2, 3]>, readonly [2, 3]>('=');
}

// ── take-last ─────────────────────────
{
  expectType<Tuple.TakeLast<2, readonly []>, readonly []>('=');

  expectType<Tuple.TakeLast<2, readonly [1, 2]>, readonly [1, 2]>('=');

  expectType<Tuple.TakeLast<2, readonly [1, 2, 3]>, readonly [2, 3]>('=');

  expectType<Tuple.TakeLast<0, readonly [1, 2, 3]>, readonly []>('=');
}

// ── take ─────────────────────────
{
  expectType<Tuple.Take<2, readonly []>, readonly []>('=');

  expectType<Tuple.Take<2, readonly [1, 2]>, readonly [1, 2]>('=');

  expectType<Tuple.Take<2, readonly [1, 2, 3]>, readonly [1, 2]>('=');

  expectType<Tuple.Take<0, readonly [1, 2, 3]>, readonly []>('=');
}

// ── zip ─────────────────────────
{
  expectType<Tuple.Zip<readonly [], readonly []>, readonly []>('=');

  expectType<Tuple.Zip<readonly [1], readonly []>, readonly []>('=');

  expectType<Tuple.Zip<readonly [], readonly [1]>, readonly []>('=');

  // <= かつ >= だが "=" だとエラーになってしまう
  expectType<
    Tuple.Zip<FixedLengthTuple<32, 1>, FixedLengthTuple<32, 2>>,
    FixedLengthTuple<32, readonly [1, 2]>
  >('<=');

  expectType<
    FixedLengthTuple<32, readonly [1, 2]>,
    Tuple.Zip<FixedLengthTuple<32, 1>, FixedLengthTuple<32, 2>>
  >('<=');

  expectType<
    Tuple.Zip<readonly [1, 2, 3], readonly [4, 5]>,
    readonly [readonly [1, 4], readonly [2, 5]]
  >('=');
}

// ── union and non-literal length/index arguments ─────────────────────────
/* A union argument marks several candidates, of which a call picks exactly
 * one. `Take` and friends used to stop the counter at the smallest member and
 * `SetAt` used to replace every candidate at once, each describing a result no
 * single call produces. */
{
  // set-at widens the candidate positions rather than replacing them
  expectType<
    Tuple.SetAt<0 | 2, 'x', readonly [1, 2, 3]>,
    readonly [1 | 'x', 2, 3 | 'x']
  >('=');

  expectType<
    Tuple.SetAt<number, 'x', readonly [1, 2, 3]>,
    readonly [1 | 'x', 2 | 'x', 3 | 'x']
  >('=');

  // a single literal index stays exact
  expectType<Tuple.SetAt<1, 'x', readonly [1, 2, 3]>, readonly [1, 'x', 3]>(
    '=',
  );

  // the counting members cannot widen in place — the candidates differ in
  // length — so a union answers exactly as `number` does
  expectType<Tuple.Take<1 | 2, readonly [1, 2, 3]>, readonly (1 | 2 | 3)[]>(
    '=',
  );

  expectType<Tuple.TakeLast<1 | 2, readonly [1, 2, 3]>, readonly (1 | 2 | 3)[]>(
    '=',
  );

  expectType<Tuple.Skip<1 | 2, readonly [1, 2, 3]>, readonly (1 | 2 | 3)[]>(
    '=',
  );

  expectType<Tuple.SkipLast<1 | 2, readonly [1, 2, 3]>, readonly (1 | 2 | 3)[]>(
    '=',
  );

  expectType<
    Tuple.Partition<1 | 2, readonly [1, 2, 3, 4]>,
    readonly (readonly (1 | 2 | 3 | 4)[])[]
  >('=');

  // `number` pins no length at all, so no tuple result is safe to claim
  expectType<Tuple.Take<number, readonly [1, 2, 3]>, readonly (1 | 2 | 3)[]>(
    '=',
  );

  expectType<
    Tuple.TakeLast<number, readonly [1, 2, 3]>,
    readonly (1 | 2 | 3)[]
  >('=');

  expectType<Tuple.Skip<number, readonly [1, 2, 3]>, readonly (1 | 2 | 3)[]>(
    '=',
  );

  expectType<
    Tuple.SkipLast<number, readonly [1, 2, 3]>,
    readonly (1 | 2 | 3)[]
  >('=');

  expectType<
    Tuple.Partition<number, readonly [1, 2]>,
    readonly (readonly (1 | 2)[])[]
  >('=');

  // A chunk size of 0 consumes nothing, so it has no answer rather than a
  // non-terminating one. Reachable from a union that merely contains 0.
  expectType<Tuple.Partition<0, readonly [1, 2]>, never>('=');

  expectType<
    Tuple.Partition<0 | 2, readonly [1, 2]>,
    readonly (readonly (1 | 2)[])[]
  >('=');
}
