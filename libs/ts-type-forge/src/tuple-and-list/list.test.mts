import { expectType } from 'ts-data-forge';
import { type DeepReadonly } from '../record/index.mjs';
import { type ArrayOfLength } from './array.mjs';
import { type List } from './list.mjs';

// ── butlast ─────────────────────────
{
  expectType<List.ButLast<readonly []>, readonly []>('=');

  expectType<List.ButLast<readonly [1]>, readonly []>('=');

  expectType<List.ButLast<readonly [1, 2, 3]>, readonly [1, 2]>('=');

  expectType<
    List.ButLast<readonly [1, 2, 3, ...(readonly number[])]>,
    readonly [1, 2, 3, ...(readonly number[])]
  >('=');
}

// ── concat ─────────────────────────
{
  expectType<List.Concat<readonly [], readonly []>, readonly []>('=');

  expectType<List.Concat<readonly [1, 2], readonly []>, readonly [1, 2]>('=');

  expectType<List.Concat<readonly [], readonly [1, 2]>, readonly [1, 2]>('=');

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

  expectType<List.Flatten<DeepReadonly<[[], [1, 2], [3]]>>, readonly [1, 2, 3]>(
    '=',
  );
}

// ── head ─────────────────────────
{
  expectType<List.Head<[]>, never>('=');

  expectType<List.Head<number[]>, never>('=');

  expectType<List.Head<[number, ...number[]], 0>, number>('=');

  expectType<List.Head<number[], 1>, 1>('=');

  expectType<List.Head<readonly []>, never>('=');

  expectType<List.Head<readonly number[]>, never>('=');

  expectType<List.Head<readonly [number, ...(readonly number[])], 0>, number>(
    '=',
  );

  expectType<List.Head<readonly number[], 1>, 1>('=');

  // Additional tests
  expectType<List.Head<[1, 2, 3]>, 1>('=');

  expectType<List.Head<[], 'default'>, 'default'>('=');

  expectType<List.Head<[boolean, string, number]>, boolean>('=');

  expectType<List.Head<readonly string[]>, string>('<=');

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
  // expectType<List.Last<readonly string[]>, string>('<='); // Skip due to complexity
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
}

// ── reverse ─────────────────────────
{
  expectType<List.Reverse<readonly []>, readonly []>('=');

  expectType<List.Reverse<[]>, readonly []>('=');

  expectType<List.Reverse<readonly [1]>, readonly [1]>('=');

  expectType<List.Reverse<readonly [1, 2, 3]>, readonly [3, 2, 1]>('=');

  expectType<List.Reverse<[1, 2, 3]>, readonly [3, 2, 1]>('=');

  expectType<List.Reverse<readonly number[]>, readonly number[]>('=');

  expectType<
    List.Reverse<readonly [1, 2, ...(readonly number[])]>,
    readonly [...number[], 2, 1]
  >('=');
}

// ── set-at ─────────────────────────
{
  expectType<List.SetAt<readonly [], 2, 999>, readonly []>('=');

  expectType<List.SetAt<readonly [1, 2], 2, 999>, readonly [1, 2]>('=');

  expectType<List.SetAt<readonly [1, 2, 3], 1, 999>, readonly [1, 999, 3]>('=');

  expectType<List.SetAt<readonly [1, 2, 3], 0, 999>, readonly [999, 2, 3]>('=');
}

// ── skip-last ─────────────────────────
{
  expectType<List.SkipLast<0, readonly []>, readonly []>('=');

  expectType<List.SkipLast<1, readonly []>, readonly []>('=');

  expectType<List.SkipLast<0, readonly [1, 2, 3]>, readonly [1, 2, 3]>('=');

  expectType<List.SkipLast<1, readonly [1, 2, 3]>, readonly [1, 2]>('=');

  expectType<List.SkipLast<5, readonly [1, 2, 3]>, readonly []>('=');

  expectType<List.SkipLast<5, readonly number[]>, readonly number[]>('=');
}

// ── skip ─────────────────────────
{
  expectType<List.Skip<0, readonly []>, readonly []>('=');

  expectType<List.Skip<1, readonly []>, readonly []>('=');

  expectType<List.Skip<0, readonly [1, 2, 3]>, readonly [1, 2, 3]>('=');

  expectType<List.Skip<1, readonly [1, 2, 3]>, readonly [2, 3]>('=');

  expectType<List.Skip<5, readonly [1, 2, 3]>, readonly []>('=');

  expectType<List.Skip<5, readonly number[]>, readonly number[]>('=');
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
}

// ── take-last ─────────────────────────
{
  expectType<List.TakeLast<2, readonly []>, readonly []>('=');

  expectType<List.TakeLast<2, readonly [1, 2]>, readonly [1, 2]>('=');

  expectType<List.TakeLast<2, readonly [1, 2, 3]>, readonly [2, 3]>('=');

  expectType<List.TakeLast<0, readonly [1, 2, 3]>, readonly []>('=');

  expectType<List.TakeLast<2, readonly number[]>, readonly number[]>('=');

  expectType<List.TakeLast<0, readonly number[]>, readonly number[]>('=');
}

// ── take ─────────────────────────
{
  expectType<List.Take<2, readonly []>, readonly []>('=');

  expectType<List.Take<2, readonly [1, 2]>, readonly [1, 2]>('=');

  expectType<List.Take<2, readonly [1, 2, 3]>, readonly [1, 2]>('=');

  expectType<List.Take<0, readonly [1, 2, 3]>, readonly []>('=');

  expectType<List.Take<2, readonly number[]>, readonly number[]>('=');

  expectType<List.Take<0, readonly number[]>, readonly number[]>('=');
}

// ── zip ─────────────────────────
{
  expectType<List.Zip<readonly [], readonly []>, readonly []>('=');

  expectType<List.Zip<readonly [1], readonly []>, readonly []>('=');

  expectType<List.Zip<readonly [], readonly [1]>, readonly []>('=');

  // <= かつ >= だが "=" だとエラーになってしまう
  expectType<
    List.Zip<ArrayOfLength<32, 1>, ArrayOfLength<32, 2>>,
    ArrayOfLength<32, readonly [1, 2]>
  >('<=');

  expectType<
    ArrayOfLength<32, readonly [1, 2]>,
    List.Zip<ArrayOfLength<32, 1>, ArrayOfLength<32, 2>>
  >('<=');

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

  expectType<
    List.Zip<readonly [number], readonly [...string[]]>,
    readonly [readonly [number, string]]
  >('=');

  expectType<
    List.Zip<readonly [string, ...string[]], readonly [number, number, number]>,
    readonly [
      readonly [string, number],
      readonly [string, number],
      readonly [string, number],
    ]
  >('~='); // "=" にできない原因は不明

  expectType<
    List.Zip<
      readonly [boolean, ...string[]],
      readonly [number, number, number]
    >,
    readonly [
      readonly [boolean, number],
      readonly [string, number],
      readonly [string, number],
    ]
  >('=');

  expectType<
    List.Zip<
      readonly [number, number, number, ...number[]],
      readonly [boolean, ...string[]]
    >,
    readonly [
      readonly [number, boolean],
      readonly [number, string],
      readonly [number, string],
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
      readonly [string, number],
      readonly [string, number],
      ...(readonly [string, number])[],
    ]
  >('=');
}
