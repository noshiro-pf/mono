import { expectType } from './expect-type.mjs';

// ReadonlyMap
{
  // eslint-disable-next-line no-restricted-globals
  const mp: ReadonlyMap<'a' | 'b', number> = new Map([
    ['a', 0],
    ['b', 1],
  ] as const);

  {
    const key = 'a';
    if (mp.has(key)) {
      expectType<typeof mp, ReadonlyMap<'a' | 'b', number>>('=');
      expectType<typeof key, 'a'>('=');
    }
  }

  {
    const key = 'b';
    if (mp.has(key)) {
      expectType<typeof mp, ReadonlyMap<'a' | 'b', number>>('=');
      expectType<typeof key, 'b'>('=');
    }
  }

  {
    const key = 'c';
    if (mp.has(key)) {
      expectType<typeof mp, ReadonlyMap<'a' | 'b', number>>('=');
      expectType<typeof key, never>('=');
    }
  }
}

// ReadonlySet
{
  // eslint-disable-next-line no-restricted-globals
  const mp: ReadonlySet<'a' | 'b'> = new Set(['a', 'b'] as const);

  {
    const key = 'a';
    if (mp.has(key)) {
      expectType<typeof mp, ReadonlySet<'a' | 'b'>>('=');
      expectType<typeof key, 'a'>('=');
    }
  }

  {
    const key = 'b';
    if (mp.has(key)) {
      expectType<typeof mp, ReadonlySet<'a' | 'b'>>('=');
      expectType<typeof key, 'b'>('=');
    }
  }

  {
    const key = 'c';
    if (mp.has(key)) {
      expectType<typeof mp, ReadonlySet<'a' | 'b'>>('=');
      expectType<typeof key, never>('=');
    }
  }
}
