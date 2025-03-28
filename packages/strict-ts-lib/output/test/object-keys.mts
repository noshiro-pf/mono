import { expectType } from './expect-type.mjs';

// from simple object
{
  const keys = Object.keys({ x: 1, y: 2 });

  expectType<typeof keys, ('x' | 'y' | (string & {}))[]>('=');
}

// from object with symbol key
{
  const symb = Symbol();
  const keys = Object.keys({ x: 1, y: 2, z: '3', 3: 4, [symb]: 5 });

  expectType<typeof keys, ('3' | 'x' | 'y' | 'z' | (string & {}))[]>('=');
}
