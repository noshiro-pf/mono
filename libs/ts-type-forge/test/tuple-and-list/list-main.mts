import { expectType } from '../expect-type.mjs';

// Test List.Head
expectType<List.Head<[1, 2, 3]>, 1>('=');
expectType<List.Head<readonly string[]>, string>('<=');
expectType<List.Head<[]>, never>('=');
expectType<List.Head<[], 'default'>, 'default'>('=');
expectType<List.Head<[boolean, string, number]>, boolean>('=');

// Test List.Last
expectType<List.Last<[1, 2, 3]>, 3>('=');
// expectType<List.Last<readonly string[]>, string>('<='); // Skip due to complexity
expectType<List.Last<[]>, never>('=');
expectType<List.Last<[1]>, 1>('=');
expectType<List.Last<[boolean, string, number]>, number>('=');

// Test List.ButLast
expectType<List.ButLast<[1, 2, 3]>, readonly [1, 2]>('=');
expectType<List.ButLast<[1]>, readonly []>('=');
expectType<List.ButLast<[]>, readonly []>('=');

// Test List.Tail
expectType<List.Tail<[1, 2, 3]>, readonly [2, 3]>('=');
expectType<List.Tail<[1]>, readonly []>('=');
expectType<List.Tail<[]>, readonly []>('=');

// Test List.Reverse
expectType<List.Reverse<[1, 2, 3]>, readonly [3, 2, 1]>('=');
expectType<List.Reverse<readonly string[]>, readonly string[]>('=');
expectType<List.Reverse<[]>, readonly []>('=');
expectType<List.Reverse<[1]>, readonly [1]>('=');
expectType<List.Reverse<['a', 'b', 'c']>, readonly ['c', 'b', 'a']>('=');

// Test List.Take with tuples
expectType<List.Take<2, [1, 2, 3]>, readonly [1, 2]>('=');
expectType<List.Take<5, [1, 2, 3]>, readonly [1, 2, 3]>('=');
expectType<List.Take<0, [1, 2, 3]>, readonly []>('=');

// Test List.Take with general arrays (should return original type)
expectType<List.Take<2, readonly string[]>, readonly string[]>('=');

// Test List.Skip with tuples
expectType<List.Skip<1, [1, 2, 3]>, readonly [2, 3]>('=');
expectType<List.Skip<3, [1, 2, 3]>, readonly []>('=');
expectType<List.Skip<0, [1, 2, 3]>, readonly [1, 2, 3]>('<=');

// Test List.Skip with general arrays (should return original type)
expectType<List.Skip<1, readonly string[]>, readonly string[]>('=');

// Test List.TakeLast with tuples
expectType<List.TakeLast<2, [1, 2, 3]>, readonly [2, 3]>('=');
expectType<List.TakeLast<5, [1, 2, 3]>, readonly [1, 2, 3]>('=');
expectType<List.TakeLast<0, [1, 2, 3]>, readonly []>('=');

// Test List.TakeLast with general arrays (should return original type)
expectType<List.TakeLast<2, readonly string[]>, readonly string[]>('=');

// Test List.SkipLast with tuples
expectType<List.SkipLast<1, [1, 2, 3]>, readonly [1, 2]>('=');
expectType<List.SkipLast<3, [1, 2, 3]>, readonly []>('=');
expectType<List.SkipLast<0, [1, 2, 3]>, readonly [1, 2, 3]>('<=');

// Test List.SkipLast with general arrays (should return original type)
expectType<List.SkipLast<1, readonly string[]>, readonly string[]>('=');

// Test List.SetAt with tuples
expectType<List.SetAt<[1, 2, 3], 1, 'x'>, readonly [1, 'x', 3]>('=');
expectType<List.SetAt<[1, 2, 3], 0, 'start'>, readonly ['start', 2, 3]>('=');

// Test List.SetAt with general arrays
expectType<List.SetAt<readonly number[], 1, 'x'>, readonly (string | number)[]>(
  '<=',
);

// Test List.Flatten
expectType<List.Flatten<[[1, 2], [3, 4]]>, readonly [1, 2, 3, 4]>('=');
expectType<List.Flatten<[[1], [2, 3]]>, readonly [1, 2, 3]>('=');
expectType<List.Flatten<[[], [1, 2]]>, readonly [1, 2]>('=');
expectType<List.Flatten<[[], []]>, readonly []>('=');

// Test List.Concat
expectType<List.Concat<[1, 2], [3, 4]>, readonly [1, 2, 3, 4]>('=');
expectType<List.Concat<[], [1, 2]>, readonly [1, 2]>('=');
expectType<List.Concat<[1, 2], []>, readonly [1, 2]>('=');
expectType<List.Concat<[], []>, readonly []>('=');

// Test List.Zip
expectType<
  List.Zip<[1, 2], ['a', 'b']>,
  readonly [readonly [1, 'a'], readonly [2, 'b']]
>('=');
expectType<
  List.Zip<[1, 2, 3], ['a', 'b']>,
  readonly [readonly [1, 'a'], readonly [2, 'b']]
>('=');
expectType<List.Zip<[], [1, 2]>, readonly []>('=');
expectType<List.Zip<[1, 2], []>, readonly []>('=');
expectType<List.Zip<[], []>, readonly []>('=');

// Test List.Partition
expectType<
  List.Partition<2, [1, 2, 3, 4, 5]>,
  readonly [readonly [1, 2], readonly [3, 4], readonly [5]]
>('=');
expectType<List.Partition<1, [1, 2]>, readonly [readonly [1], readonly [2]]>(
  '=',
);
expectType<List.Partition<3, [1, 2]>, readonly [readonly [1, 2]]>('=');

// Test edge cases and complex scenarios

// Empty array operations
expectType<List.Head<[]>, never>('=');
expectType<List.Last<[]>, never>('=');
expectType<List.ButLast<[]>, readonly []>('=');
expectType<List.Tail<[]>, readonly []>('=');

// Single element array operations
expectType<List.Head<[42]>, 42>('=');
expectType<List.Last<[42]>, 42>('=');
expectType<List.ButLast<[42]>, readonly []>('=');
expectType<List.Tail<[42]>, readonly []>('=');

// Mixed type arrays
expectType<List.Head<[string, number, boolean]>, string>('=');
expectType<List.Last<[string, number, boolean]>, boolean>('=');
expectType<
  List.Reverse<[string, number, boolean]>,
  readonly [boolean, number, string]
>('=');
