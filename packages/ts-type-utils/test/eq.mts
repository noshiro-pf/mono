/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-duplicate-type-constituents */

import { expectType } from './expect-type.mjs';

// @ts-expect-error
expectType<number, string>('=');
// @ts-expect-error
expectType<number, string>('<=');
expectType<number, string>('!=');

expectType<1, 1>('=');
expectType<1, 1>('<=');
// @ts-expect-error
expectType<1, 1>('!=');

expectType<1 | 1, 1>('=');
expectType<1 | 1, 1>('<=');
// @ts-expect-error
expectType<1 | 1, 1>('!=');

// @ts-expect-error
expectType<1 | 2, 1>('=');
// @ts-expect-error
expectType<1 | 2, 1>('<=');
expectType<1 | 2, 1>('!=');

// @ts-expect-error
expectType<1, 1 | 2>('=');
expectType<1, 1 | 2>('<=');
expectType<1, 1 | 2>('!=');

expectType<[1, 2, 3], [1, 2, 3]>('=');
expectType<[1, 2, 3], [1, 2, 3]>('<=');
// @ts-expect-error
expectType<[1, 2, 3], [1, 2, 3]>('!=');

expectType<readonly [1, 2, 3], readonly [1, 2, 3]>('=');
expectType<readonly [1, 2, 3], readonly [1, 2, 3]>('<=');
// @ts-expect-error
expectType<readonly [1, 2, 3], readonly [1, 2, 3]>('!=');

// @ts-expect-error
expectType<{ x: number }, { x: unknown }>('=');
expectType<{ x: number }, { x: unknown }>('<=');
expectType<{ x: number }, { x: unknown }>('!=');

// @ts-expect-error
expectType<{ x: 1 }, { x: number }>('=');
expectType<{ x: 1 }, { x: number }>('<=');
expectType<{ x: 1 }, { x: number }>('!=');

// @ts-expect-error
expectType<{ x: 1 } & { y: 2 }, { x: 1; y: 2 }>('=');
expectType<{ x: 1 } & { y: 2 }, { x: 1; y: 2 }>('<=');
expectType<{ x: 1 } & { y: 2 }, { x: 1; y: 2 }>('!=');

// @ts-expect-error
expectType<[1, 2, 3], readonly [1, 2, 3]>('=');
expectType<[1, 2, 3], readonly [1, 2, 3]>('<=');
expectType<[1, 2, 3], readonly [1, 2, 3]>('!=');

// @ts-expect-error
expectType<any, 1>('=');
// @ts-expect-error
expectType<any, 1>('<=');
expectType<any, 1>('!=');

// @ts-expect-error
expectType<any, never>('=');
// @ts-expect-error
expectType<any, never>('<=');
expectType<any, never>('!=');

// @ts-expect-error
expectType<any, number>('=');
// @ts-expect-error
expectType<any, number>('<=');
expectType<any, number>('!=');

// @ts-expect-error
expectType<[any], [number]>('=');
expectType<[any], [number]>('<=');
expectType<[any], [number]>('!=');

// @ts-expect-error
expectType<{ x: any }, { x: number }>('=');
expectType<{ x: any }, { x: number }>('<=');
expectType<{ x: any }, { x: number }>('!=');

// distinguish between readonly and non-readonly
expectType<[1, 2, 3], readonly [1, 2, 3]>('!=');

// distinguish any
expectType<any, 1>('!=');
expectType<any, never>('!=');
expectType<[any], [number]>('!=');
expectType<{ x: any }, { x: number }>('!=');

expectType<1 | 2, 1>('!=');

// distinguish between intersection and merged record
expectType<{ x: 1 } & { y: 2 }, { x: 1; y: 2 }>('!=');
expectType<{ x: 1 } & { y: 2 }, { x: 1; y: 2 }>('~=');

{
  // @ts-expect-error
  expectType<{ x: 1 } & { y: 2 }, { x: 1; y: 2 }>('=');

  expectType<{ x: 1 } & { y: 2 }, { x: 1; y: 2 }>('~=');

  expectType<{ x: 1 } & { y: 2 }, { x: 1; y: 2 }>('<=');

  expectType<{ x: 1 } & { y: 2 }, { x: 1; y: 2 }>('>=');

  // @ts-expect-error
  expectType<{ x: 1 } & { y: 2 }, { x: 1; y: 2 }>('!<=');

  // @ts-expect-error
  expectType<{ x: 1 } & { y: 2 }, { x: 1; y: 2 }>('!>=');

  expectType<{ x: 1 } & { y: 2 }, { x: 1; y: 2 }>('!=');
}

{
  // @ts-expect-error
  expectType<{ x: 0; y: 0 }, { x: 0 }>('=');

  // @ts-expect-error
  expectType<{ x: 0; y: 0 }, { x: 0 }>('~=');

  expectType<{ x: 0; y: 0 }, { x: 0 }>('<=');

  // @ts-expect-error
  expectType<{ x: 0; y: 0 }, { x: 0 }>('>=');

  // @ts-expect-error
  expectType<{ x: 0; y: 0 }, { x: 0 }>('!<=');

  expectType<{ x: 0; y: 0 }, { x: 0 }>('!>=');

  expectType<{ x: 0; y: 0 }, { x: 0 }>('!=');
}

{
  // @ts-expect-error
  expectType<{ x: 0 }, { x: 0; y: 0 }>('=');

  // @ts-expect-error
  expectType<{ x: 0 }, { x: 0; y: 0 }>('~=');

  // @ts-expect-error
  expectType<{ x: 0 }, { x: 0; y: 0 }>('<=');

  expectType<{ x: 0 }, { x: 0; y: 0 }>('>=');

  expectType<{ x: 0 }, { x: 0; y: 0 }>('!<=');

  // @ts-expect-error
  expectType<{ x: 0 }, { x: 0; y: 0 }>('!>=');

  expectType<{ x: 0 }, { x: 0; y: 0 }>('!=');
}
