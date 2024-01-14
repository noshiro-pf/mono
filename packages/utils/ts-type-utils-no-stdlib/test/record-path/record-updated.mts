import { expectType } from '../expect-type.mjs';
import { type _DeepReadonly as DeepReadonly } from '../utils-for-test.mjs';

expectType<RecordUpdated<0, readonly [], 'changed'>, 'changed'>('=');

expectType<RecordUpdated<readonly [], readonly [], 'changed'>, 'changed'>('=');

expectType<
  RecordUpdated<readonly [0, 1, 2], readonly [], 'changed'>,
  'changed'
>('=');

expectType<
  RecordUpdated<readonly [0, 1, 2], readonly [1], 'changed'>,
  readonly [0, 'changed', 2]
>('=');

type R0 = DeepReadonly<{
  x: {
    a: 1;
    b: { x: [number, ...string[]] }[];
  };
  y: {
    c: {
      d: { x: number }[];
      4: 5;
    };
    g: [{ x: number }, ...{ y: string[] }[]];
    h: (a: number) => string;
    i: (a: string) => number;
  };
  z: [1, 2, { e: 3; f: [6, 7] }];
}>;

expectType<RecordUpdated<R0, readonly [], 'changed'>, 'changed'>('=');
expectType<RecordUpdated<R0, readonly [], never>, never>('=');

expectType<
  RecordUpdated<R0, readonly ['x'], 'changed'>,
  DeepReadonly<{
    x: 'changed';
    y: {
      c: {
        d: { x: number }[];
        4: 5;
      };
      g: [{ x: number }, ...{ y: string[] }[]];
      h: (a: number) => string;
      i: (a: string) => number;
    };
    z: [1, 2, { e: 3; f: [6, 7] }];
  }>
>('=');

expectType<
  RecordUpdated<R0, readonly ['x', 'a'], 'changed'>,
  DeepReadonly<{
    x: {
      a: 'changed';
      b: { x: [number, ...string[]] }[];
    };
    y: {
      c: {
        d: { x: number }[];
        4: 5;
      };
      g: [{ x: number }, ...{ y: string[] }[]];
      h: (a: number) => string;
      i: (a: string) => number;
    };
    z: [1, 2, { e: 3; f: [6, 7] }];
  }>
>('=');

expectType<
  RecordUpdated<R0, readonly ['x', 'b'], 'changed'>,
  DeepReadonly<{
    x: {
      a: 1;
      b: 'changed';
    };
    y: {
      c: {
        d: { x: number }[];
        4: 5;
      };
      g: [{ x: number }, ...{ y: string[] }[]];
      h: (a: number) => string;
      i: (a: string) => number;
    };
    z: [1, 2, { e: 3; f: [6, 7] }];
  }>
>('=');

expectType<
  RecordUpdated<R0, readonly ['y'], 'changed'>,
  DeepReadonly<{
    x: {
      a: 1;
      b: { x: [number, ...string[]] }[];
    };
    y: 'changed';
    z: [1, 2, { e: 3; f: [6, 7] }];
  }>
>('=');

expectType<
  RecordUpdated<R0, readonly ['y', 'c'], 'changed'>,
  DeepReadonly<{
    x: {
      a: 1;
      b: { x: [number, ...string[]] }[];
    };
    y: {
      c: 'changed';
      g: [{ x: number }, ...{ y: string[] }[]];
      h: (a: number) => string;
      i: (a: string) => number;
    };
    z: [1, 2, { e: 3; f: [6, 7] }];
  }>
>('=');

expectType<
  RecordUpdated<R0, readonly ['y', 'c', 'd'], 'changed'>,
  DeepReadonly<{
    x: {
      a: 1;
      b: { x: [number, ...string[]] }[];
    };
    y: {
      c: {
        d: 'changed';
        4: 5;
      };
      g: [{ x: number }, ...{ y: string[] }[]];
      h: (a: number) => string;
      i: (a: string) => number;
    };
    z: [1, 2, { e: 3; f: [6, 7] }];
  }>
>('=');

expectType<
  RecordUpdated<R0, readonly ['y', 'c', 4], 'changed'>,
  DeepReadonly<{
    x: {
      a: 1;
      b: { x: [number, ...string[]] }[];
    };
    y: {
      c: {
        d: { x: number }[];
        4: 'changed';
      };
      g: [{ x: number }, ...{ y: string[] }[]];
      h: (a: number) => string;
      i: (a: string) => number;
    };
    z: [1, 2, { e: 3; f: [6, 7] }];
  }>
>('=');

expectType<
  RecordUpdated<R0, readonly ['y', 'g'], 'changed'>,
  DeepReadonly<{
    x: {
      a: 1;
      b: { x: [number, ...string[]] }[];
    };
    y: {
      c: {
        d: { x: number }[];
        4: 5;
      };
      g: 'changed';
      h: (a: number) => string;
      i: (a: string) => number;
    };
    z: [1, 2, { e: 3; f: [6, 7] }];
  }>
>('=');

expectType<
  RecordUpdated<R0, readonly ['z'], 'changed'>,
  DeepReadonly<{
    x: {
      a: 1;
      b: { x: [number, ...string[]] }[];
    };
    y: {
      c: {
        d: { x: number }[];
        4: 5;
      };
      g: [{ x: number }, ...{ y: string[] }[]];
      h: (a: number) => string;
      i: (a: string) => number;
    };
    z: 'changed';
  }>
>('=');

expectType<
  RecordUpdated<R0, readonly ['z', 0], 'changed'>,
  DeepReadonly<{
    x: {
      a: 1;
      b: { x: [number, ...string[]] }[];
    };
    y: {
      c: {
        d: { x: number }[];
        4: 5;
      };
      g: [{ x: number }, ...{ y: string[] }[]];
      h: (a: number) => string;
      i: (a: string) => number;
    };
    z: ['changed', 2, { e: 3; f: [6, 7] }];
  }>
>('=');

expectType<
  RecordUpdated<R0, readonly ['z', 1], 'changed'>,
  DeepReadonly<{
    x: {
      a: 1;
      b: { x: [number, ...string[]] }[];
    };
    y: {
      c: {
        d: { x: number }[];
        4: 5;
      };
      g: [{ x: number }, ...{ y: string[] }[]];
      h: (a: number) => string;
      i: (a: string) => number;
    };
    z: [1, 'changed', { e: 3; f: [6, 7] }];
  }>
>('=');

expectType<
  RecordUpdated<R0, readonly ['z', 2], 'changed'>,
  DeepReadonly<{
    x: {
      a: 1;
      b: { x: [number, ...string[]] }[];
    };
    y: {
      c: {
        d: { x: number }[];
        4: 5;
      };
      g: [{ x: number }, ...{ y: string[] }[]];
      h: (a: number) => string;
      i: (a: string) => number;
    };
    z: [1, 2, 'changed'];
  }>
>('=');

expectType<
  RecordUpdated<R0, readonly ['z', 2, 'e'], 'changed'>,
  DeepReadonly<{
    x: {
      a: 1;
      b: { x: [number, ...string[]] }[];
    };
    y: {
      c: {
        d: { x: number }[];
        4: 5;
      };
      g: [{ x: number }, ...{ y: string[] }[]];
      h: (a: number) => string;
      i: (a: string) => number;
    };
    z: [1, 2, { e: 'changed'; f: [6, 7] }];
  }>
>('=');

expectType<
  RecordUpdated<R0, readonly ['z', 2, 'f'], 'changed'>,
  DeepReadonly<{
    x: {
      a: 1;
      b: { x: [number, ...string[]] }[];
    };
    y: {
      c: {
        d: { x: number }[];
        4: 5;
      };
      g: [{ x: number }, ...{ y: string[] }[]];
      h: (a: number) => string;
      i: (a: string) => number;
    };
    z: [1, 2, { e: 3; f: 'changed' }];
  }>
>('=');

expectType<
  RecordUpdated<R0, readonly ['z', 2, 'f', 0], 'changed'>,
  DeepReadonly<{
    x: {
      a: 1;
      b: { x: [number, ...string[]] }[];
    };
    y: {
      c: {
        d: { x: number }[];
        4: 5;
      };
      g: [{ x: number }, ...{ y: string[] }[]];
      h: (a: number) => string;
      i: (a: string) => number;
    };
    z: [1, 2, { e: 3; f: ['changed', 7] }];
  }>
>('=');

expectType<
  RecordUpdated<R0, readonly ['z', 2, 'f', 1], 'changed'>,
  DeepReadonly<{
    x: {
      a: 1;
      b: { x: [number, ...string[]] }[];
    };
    y: {
      c: {
        d: { x: number }[];
        4: 5;
      };
      g: [{ x: number }, ...{ y: string[] }[]];
      h: (a: number) => string;
      i: (a: string) => number;
    };
    z: [1, 2, { e: 3; f: [6, 'changed'] }];
  }>
>('=');
