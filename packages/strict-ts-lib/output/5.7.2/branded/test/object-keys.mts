import { expectType } from './expect-type.mjs';

// https://stackoverflow.com/questions/55012174/why-doesnt-object-keys-return-a-keyof-type-in-typescript

// from simple object
{
  const keys = Object.keys({ x: 1, y: 2 });

  expectType<typeof keys, readonly ('x' | 'y' | (string & {}))[]>('=');
}

// from object with symbol key
{
  const symb = Symbol();
  const keys = Object.keys({ x: 1, y: 2, z: '3', 3: 4, [symb]: 5 });

  expectType<typeof keys, readonly ('3' | 'x' | 'y' | 'z' | (string & {}))[]>(
    '=',
  );
}
