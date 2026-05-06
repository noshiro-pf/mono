import { expectType } from 'ts-data-forge';
import { type DeepReadonly } from '../record/index.mjs';
import { type ArrayOfLength } from './array.mjs';
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
  expectType<Tuple.SetAt<readonly [], 2, 999>, readonly []>('=');

  expectType<Tuple.SetAt<readonly [1, 2], 2, 999>, readonly [1, 2]>('=');

  expectType<Tuple.SetAt<readonly [1, 2, 3], 1, 999>, readonly [1, 999, 3]>(
    '=',
  );

  expectType<Tuple.SetAt<readonly [1, 2, 3], 0, 999>, readonly [999, 2, 3]>(
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
    Tuple.Zip<ArrayOfLength<32, 1>, ArrayOfLength<32, 2>>,
    ArrayOfLength<32, readonly [1, 2]>
  >('<=');

  expectType<
    ArrayOfLength<32, readonly [1, 2]>,
    Tuple.Zip<ArrayOfLength<32, 1>, ArrayOfLength<32, 2>>
  >('<=');

  expectType<
    Tuple.Zip<readonly [1, 2, 3], readonly [4, 5]>,
    readonly [readonly [1, 4], readonly [2, 5]]
  >('=');
}
