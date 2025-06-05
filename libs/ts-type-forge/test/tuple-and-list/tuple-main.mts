import { expectType } from '../expect-type.mjs';

// Test Tuple.Head
expectType<Tuple.Head<[1, 2, 3]>, 1>('=');
expectType<Tuple.Head<[]>, never>('=');
expectType<Tuple.Head<[], 'default'>, 'default'>('=');
expectType<Tuple.Head<[boolean, string, number]>, boolean>('=');
expectType<Tuple.Head<readonly [1, 2, 3]>, 1>('=');

// Test Tuple.Last
expectType<Tuple.Last<[1, 2, 3]>, 3>('=');
expectType<Tuple.Last<[]>, never>('=');
expectType<Tuple.Last<[1]>, 1>('=');
expectType<Tuple.Last<[boolean, string, number]>, number>('=');
expectType<Tuple.Last<readonly [1, 2, 3]>, 3>('=');

// Test Tuple.ButLast
expectType<Tuple.ButLast<[1, 2, 3]>, readonly [1, 2]>('=');
expectType<Tuple.ButLast<[1]>, readonly []>('=');
expectType<Tuple.ButLast<[]>, readonly []>('=');
expectType<Tuple.ButLast<readonly [1, 2, 3]>, readonly [1, 2]>('=');

// Test Tuple.Tail
expectType<Tuple.Tail<[1, 2, 3]>, readonly [2, 3]>('=');
expectType<Tuple.Tail<[1]>, readonly []>('=');
expectType<Tuple.Tail<[]>, readonly []>('=');
expectType<Tuple.Tail<readonly [1, 2, 3]>, readonly [2, 3]>('=');

// Test Tuple.Reverse
expectType<Tuple.Reverse<[1, 2, 3]>, readonly [3, 2, 1]>('=');
expectType<Tuple.Reverse<[]>, readonly []>('=');
expectType<Tuple.Reverse<[1]>, readonly [1]>('=');
expectType<Tuple.Reverse<['a', 'b', 'c']>, readonly ['c', 'b', 'a']>('=');
expectType<Tuple.Reverse<readonly [1, 2, 3]>, readonly [3, 2, 1]>('=');

// Test Tuple.Take
expectType<Tuple.Take<2, [1, 2, 3]>, readonly [1, 2]>('=');
expectType<Tuple.Take<5, [1, 2, 3]>, readonly [1, 2, 3]>('=');
expectType<Tuple.Take<0, [1, 2, 3]>, readonly []>('=');
expectType<Tuple.Take<1, [1, 2, 3]>, readonly [1]>('=');
expectType<Tuple.Take<3, [1, 2, 3]>, readonly [1, 2, 3]>('=');

// Test Tuple.Skip
expectType<Tuple.Skip<1, [1, 2, 3]>, readonly [2, 3]>('=');
expectType<Tuple.Skip<3, [1, 2, 3]>, readonly []>('=');
expectType<Tuple.Skip<0, [1, 2, 3]>, readonly [1, 2, 3]>('<=');
expectType<Tuple.Skip<2, [1, 2, 3]>, readonly [3]>('=');
expectType<Tuple.Skip<5, [1, 2, 3]>, readonly []>('=');

// Test Tuple.TakeLast
expectType<Tuple.TakeLast<2, [1, 2, 3]>, readonly [2, 3]>('=');
expectType<Tuple.TakeLast<5, [1, 2, 3]>, readonly [1, 2, 3]>('=');
expectType<Tuple.TakeLast<0, [1, 2, 3]>, readonly []>('=');
expectType<Tuple.TakeLast<1, [1, 2, 3]>, readonly [3]>('=');
expectType<Tuple.TakeLast<3, [1, 2, 3]>, readonly [1, 2, 3]>('=');

// Test Tuple.SkipLast
expectType<Tuple.SkipLast<1, [1, 2, 3]>, readonly [1, 2]>('=');
expectType<Tuple.SkipLast<3, [1, 2, 3]>, readonly []>('=');
expectType<Tuple.SkipLast<0, [1, 2, 3]>, readonly [1, 2, 3]>('<=');
expectType<Tuple.SkipLast<2, [1, 2, 3]>, readonly [1]>('=');
expectType<Tuple.SkipLast<5, [1, 2, 3]>, readonly []>('=');

// Test Tuple.SetAt
expectType<Tuple.SetAt<[1, 2, 3], 1, 'x'>, readonly [1, 'x', 3]>('=');
expectType<Tuple.SetAt<[1, 2, 3], 0, 'start'>, readonly ['start', 2, 3]>('=');
expectType<Tuple.SetAt<[1, 2, 3], 2, 'end'>, readonly [1, 2, 'end']>('=');
expectType<Tuple.SetAt<[], 0, 'x'>, readonly []>('<='); // Setting on empty tuple

// Test Tuple.Flatten
expectType<Tuple.Flatten<[[1, 2], [3, 4]]>, readonly [1, 2, 3, 4]>('=');
expectType<Tuple.Flatten<[[1], [2, 3]]>, readonly [1, 2, 3]>('=');
expectType<Tuple.Flatten<[[], [1, 2]]>, readonly [1, 2]>('=');
expectType<Tuple.Flatten<[[], []]>, readonly []>('=');
expectType<Tuple.Flatten<[[1], [2, [3]]]>, readonly [1, 2, [3]]>('='); // Only flattens one level

// Test Tuple.Concat
expectType<Tuple.Concat<[1, 2], [3, 4]>, readonly [1, 2, 3, 4]>('=');
expectType<Tuple.Concat<[], [1, 2]>, readonly [1, 2]>('=');
expectType<Tuple.Concat<[1, 2], []>, readonly [1, 2]>('=');
expectType<Tuple.Concat<[], []>, readonly []>('=');
expectType<Tuple.Concat<[1], [2]>, readonly [1, 2]>('=');

// Test Tuple.Zip
expectType<
  Tuple.Zip<[1, 2], ['a', 'b']>,
  readonly [readonly [1, 'a'], readonly [2, 'b']]
>('=');
expectType<
  Tuple.Zip<[1, 2, 3], ['a', 'b']>,
  readonly [readonly [1, 'a'], readonly [2, 'b']]
>('=');
expectType<
  Tuple.Zip<[1, 2], ['a', 'b', 'c']>,
  readonly [readonly [1, 'a'], readonly [2, 'b']]
>('=');
expectType<Tuple.Zip<[], ['a']>, readonly []>('=');
expectType<Tuple.Zip<[1], []>, readonly []>('=');
expectType<Tuple.Zip<[], []>, readonly []>('=');

// Test Tuple.Partition
expectType<
  Tuple.Partition<2, [1, 2, 3, 4, 5]>,
  readonly [readonly [1, 2], readonly [3, 4], readonly [5]]
>('=');
expectType<
  Tuple.Partition<3, [1, 2, 3, 4, 5, 6]>,
  readonly [readonly [1, 2, 3], readonly [4, 5, 6]]
>('=');
expectType<Tuple.Partition<1, [1, 2]>, readonly [readonly [1], readonly [2]]>(
  '=',
);
expectType<Tuple.Partition<5, [1, 2]>, readonly [readonly [1, 2]]>('=');
expectType<Tuple.Partition<2, []>, readonly []>('<=');

// Test edge cases

// Empty tuple operations
expectType<Tuple.Head<[]>, never>('=');
expectType<Tuple.Last<[]>, never>('=');
expectType<Tuple.ButLast<[]>, readonly []>('=');
expectType<Tuple.Tail<[]>, readonly []>('=');
expectType<Tuple.Reverse<[]>, readonly []>('=');

// Single element tuple operations
expectType<Tuple.Head<[42]>, 42>('=');
expectType<Tuple.Last<[42]>, 42>('=');
expectType<Tuple.ButLast<[42]>, readonly []>('=');
expectType<Tuple.Tail<[42]>, readonly []>('=');
expectType<Tuple.Reverse<[42]>, readonly [42]>('=');

// Mixed type tuples
expectType<Tuple.Head<[string, number, boolean]>, string>('=');
expectType<Tuple.Last<[string, number, boolean]>, boolean>('=');
expectType<
  Tuple.Reverse<[string, number, boolean]>,
  readonly [boolean, number, string]
>('=');

// Complex nested tuples
expectType<
  Tuple.Flatten<[[string, number], [boolean]]>,
  readonly [string, number, boolean]
>('=');
expectType<
  Tuple.Concat<[string, number], [boolean, symbol]>,
  readonly [string, number, boolean, symbol]
>('=');

// Take/Skip edge cases
expectType<Tuple.Take<0, []>, readonly []>('<=');
expectType<Tuple.Skip<0, []>, readonly []>('<=');
expectType<Tuple.TakeLast<0, []>, readonly []>('<=');
expectType<Tuple.SkipLast<0, []>, readonly []>('<=');

// Large tuples to test recursion
expectType<Tuple.Take<3, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]>, readonly [1, 2, 3]>(
  '=',
);
expectType<Tuple.Skip<7, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]>, readonly [8, 9, 10]>(
  '=',
);
expectType<
  Tuple.TakeLast<3, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]>,
  readonly [8, 9, 10]
>('=');
expectType<
  Tuple.SkipLast<7, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]>,
  readonly [1, 2, 3]
>('=');
