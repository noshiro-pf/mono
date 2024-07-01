import { expectType } from './expect-type.mjs';

// from simple object
{
  const keys = Object.keys({ x: 1, y: 2 });

  expectType<typeof keys, readonly ('x' | 'y')[]>('=');
}

// from object with symbol key
{
  const symb = Symbol();
  const keys = Object.keys({ x: 1, y: 2, z: '3', 3: 4, [symb]: 5 });

  expectType<typeof keys, readonly ('3' | 'x' | 'y' | 'z')[]>('=');
}
