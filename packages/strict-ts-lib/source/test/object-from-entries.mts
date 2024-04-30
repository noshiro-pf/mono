import { expectType } from './expect-type.mjs';

// from tuple of pairs
{
  const entries = [
    ['x', 1],
    ['y', 2],
  ] as const satisfies DeepReadonly<[['x', 1], ['y', 2]]>;

  const obj = Object.fromEntries(entries);

  expectType<typeof obj, Readonly<{ x: 1; y: 2 }>>('=');
}

// from pair array with union key
{
  const entries: readonly (readonly ['x' | 'y' | 'z' | 4, number])[] = [
    ['x', 1],
    ['y', 2],
    ['z', 3],
    [4, 3],
  ] as const;

  const obj = Object.fromEntries(entries);

  expectType<typeof obj, Partial<Record<'x' | 'y' | 'z' | 4, number>>>('=');
}

// from pair array with primitive key
{
  const entries: readonly (readonly [string, number])[] = [
    ['x', 1],
    ['y', 2],
    ['z', 3],
  ] as const;

  const obj = Object.fromEntries(entries);

  expectType<typeof obj, Record<string, number>>('=');
}
