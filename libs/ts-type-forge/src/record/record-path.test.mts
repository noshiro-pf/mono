import { expectType } from 'ts-data-forge';
import type { DeepReadonly } from './deep.mjs';
import type {
  RecordLeafPaths,
  RecordLeafPathsWithIndex,
  RecordPathAndValueTypeTuple,
  RecordPaths,
  RecordPathsWithIndex,
  RecordUpdated,
  RecordValueAtPath,
  RecordValueAtPathWithIndex,
  TSTypeForgeInternals_RecordPathPrefixes,
} from './record-path.mjs';

// `RecordPathPrefixes` generates all prefixes of a tuple, including `[]`.
expectType<
  TSTypeForgeInternals_RecordPathPrefixes<readonly [1, 2, 3]>,
  readonly [] | readonly [1, 2, 3] | readonly [1, 2] | readonly [1]
>('=');

expectType<TSTypeForgeInternals_RecordPathPrefixes<[]>, readonly []>('=');

// ── key-path-and-value-pair ─────────────────────────
{
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

  expectType<RecordPathAndValueTypeTuple<R0>[0], RecordPaths<R0>>('=');

  expectType<
    RecordPathAndValueTypeTuple<R0>,
    DeepReadonly<
      | [[], R0]
      | [['x'], { a: 1; b: { x: [number, ...string[]] }[] }]
      | [['x', 'a'], 1]
      | [['x', 'b'], { x: [number, ...string[]] }[]]
      | [
          ['y'],
          {
            c: { d: { x: number }[]; 4: 5 };
            g: [{ x: number }, ...{ y: string[] }[]];
            h: (a: number) => string;
            i: (a: string) => number;
          },
        ]
      | [['y', 'c'], { d: { x: number }[]; 4: 5 }]
      | [['y', 'c', 'd'], { x: number }[]]
      | [['y', 'c', 4], 5]
      | [['y', 'g'], [{ x: number }, ...{ y: string[] }[]]]
      | [['y', 'h'], (a: number) => string]
      | [['y', 'i'], (a: string) => number]
      | [['z', 0], 1]
      | [['z', 1], 2]
      | [['z', 2, 'e'], 3]
      | [['z', 2, 'f', 0], 6]
      | [['z', 2, 'f', 1], 7]
      | [['z', 2, 'f'], [6, 7]]
      | [['z', 2], { e: 3; f: [6, 7] }]
      | [['z'], [1, 2, { e: 3; f: [6, 7] }]]
    >
  >('=');
}

// ── record-paths ─────────────────────────
{
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

  type K0 = RecordLeafPaths<R0>;

  expectType<
    K0,
    | readonly ['x', 'a']
    | readonly ['x', 'b']
    | readonly ['y', 'c', 'd']
    | readonly ['y', 'c', 4]
    | readonly ['y', 'g']
    | readonly ['y', 'h']
    | readonly ['y', 'i']
    | readonly ['z', 0]
    | readonly ['z', 1]
    | readonly ['z', 2, 'e']
    | readonly ['z', 2, 'f', 0]
    | readonly ['z', 2, 'f', 1]
  >('=');

  type K1 = RecordLeafPathsWithIndex<R0>;

  expectType<
    K1,
    | readonly ['x', 'a']
    | readonly ['x', 'b', number, 'x', number]
    | readonly ['y', 'c', 'd', number, 'x']
    | readonly ['y', 'c', 4]
    | readonly ['y', 'g', number, 'x']
    | readonly ['y', 'g', number, 'y', number]
    | readonly ['y', 'h']
    | readonly ['y', 'i']
    | readonly ['z', 0]
    | readonly ['z', 1]
    | readonly ['z', 2, 'e']
    | readonly ['z', 2, 'f', 0]
    | readonly ['z', 2, 'f', 1]
  >('=');

  type K2 = RecordLeafPathsWithIndex<[]>;

  expectType<K2, readonly []>('=');

  expectType<RecordLeafPathsWithIndex<Record<1, unknown>>, readonly [1]>('=');

  type K3 = RecordPathsWithIndex<R0>;

  expectType<
    K3,
    | readonly ['x', 'a']
    | readonly ['x', 'b', number, 'x', number]
    | readonly ['x', 'b', number, 'x']
    | readonly ['x', 'b', number]
    | readonly ['x', 'b']
    | readonly ['x']
    | readonly ['y', 'c', 'd', number, 'x']
    | readonly ['y', 'c', 'd', number]
    | readonly ['y', 'c', 'd']
    | readonly ['y', 'c', 4]
    | readonly ['y', 'c']
    | readonly ['y', 'g', number, 'x']
    | readonly ['y', 'g', number, 'y', number]
    | readonly ['y', 'g', number, 'y']
    | readonly ['y', 'g', number]
    | readonly ['y', 'g']
    | readonly ['y', 'h']
    | readonly ['y', 'i']
    | readonly ['y']
    | readonly ['z', 0]
    | readonly ['z', 1]
    | readonly ['z', 2, 'e']
    | readonly ['z', 2, 'f', 0]
    | readonly ['z', 2, 'f', 1]
    | readonly ['z', 2, 'f']
    | readonly ['z', 2]
    | readonly ['z']
    | readonly []
  >('=');

  type K4 = RecordPaths<R0>;

  expectType<
    K4,
    | readonly ['x', 'a']
    | readonly ['x', 'b']
    | readonly ['x']
    | readonly ['y', 'c', 'd']
    | readonly ['y', 'c', 4]
    | readonly ['y', 'c']
    | readonly ['y', 'g']
    | readonly ['y', 'h']
    | readonly ['y', 'i']
    | readonly ['y']
    | readonly ['z', 0]
    | readonly ['z', 1]
    | readonly ['z', 2, 'e']
    | readonly ['z', 2, 'f', 0]
    | readonly ['z', 2, 'f', 1]
    | readonly ['z', 2, 'f']
    | readonly ['z', 2]
    | readonly ['z']
    | readonly []
  >('=');
}

// ── record-updated ─────────────────────────
{
  expectType<RecordUpdated<0, readonly [], 'changed'>, 'changed'>('=');

  expectType<RecordUpdated<readonly [], readonly [], 'changed'>, 'changed'>(
    '=',
  );

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
}

// ── record-value-at-path ─────────────────────────
{
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

  expectType<RecordValueAtPath<R0, readonly []>, R0>('=');

  expectType<
    RecordValueAtPath<R0, readonly ['x']>,
    DeepReadonly<{ a: 1; b: { x: [number, ...string[]] }[] }>
  >('=');

  expectType<RecordValueAtPath<R0, readonly ['x', 'a']>, 1>('=');

  expectType<
    RecordValueAtPath<R0, readonly ['x', 'b']>,
    DeepReadonly<{ x: [number, ...string[]] }[]>
  >('=');

  expectType<
    RecordValueAtPath<R0, readonly ['y']>,
    DeepReadonly<{
      c: {
        d: { x: number }[];
        4: 5;
      };
      g: [{ x: number }, ...{ y: string[] }[]];
      h: (a: number) => string;
      i: (a: string) => number;
    }>
  >('=');

  expectType<
    RecordValueAtPath<R0, readonly ['y', 'c']>,
    DeepReadonly<{
      d: { x: number }[];
      4: 5;
    }>
  >('=');

  expectType<
    RecordValueAtPath<R0, readonly ['y', 'c', 'd']>,
    DeepReadonly<{ x: number }[]>
  >('=');

  expectType<
    RecordValueAtPath<R0, readonly ['y', 'g']>,
    DeepReadonly<[{ x: number }, ...{ y: string[] }[]]>
  >('=');

  expectType<RecordValueAtPath<R0, readonly ['y', 'h']>, (a: number) => string>(
    '=',
  );

  expectType<RecordValueAtPath<R0, readonly ['y', 'i']>, (a: string) => number>(
    '=',
  );

  expectType<
    RecordValueAtPath<R0, readonly ['z']>,
    DeepReadonly<[1, 2, { e: 3; f: [6, 7] }]>
  >('=');

  expectType<RecordValueAtPath<R0, readonly ['z', 0]>, 1>('=');

  expectType<RecordValueAtPath<R0, readonly ['z', 1]>, 2>('=');

  expectType<
    RecordValueAtPath<R0, readonly ['z', 2]>,
    DeepReadonly<{ e: 3; f: [6, 7] }>
  >('=');

  expectType<RecordValueAtPath<R0, readonly ['z', 2, 'e']>, 3>('=');

  expectType<RecordValueAtPath<R0, readonly ['z', 2, 'f']>, readonly [6, 7]>(
    '=',
  );

  expectType<RecordValueAtPath<R0, readonly ['z', 2, 'f', 0]>, 6>('=');

  expectType<RecordValueAtPath<R0, readonly ['z', 2, 'f', 1]>, 7>('=');
}

// ── a path through an optional, nullable or union parent ─────────────────────────
{
  type R0 = Readonly<{ a?: Readonly<{ c: 1; d?: Readonly<{ e: 2 }> }> }>;

  expectType<RecordValueAtPath<R0, readonly ['a', 'c']>, 1 | undefined>('=');

  expectType<RecordValueAtPath<R0, readonly ['a', 'd', 'e']>, 2 | undefined>(
    '=',
  );

  expectType<
    RecordValueAtPath<
      Readonly<{ n: Readonly<{ x: 1 }> | null }>,
      readonly ['n', 'x']
    >,
    1 | undefined
  >('=');

  expectType<
    RecordValueAtPath<
      Readonly<{ u: Readonly<{ k: 1 }> | Readonly<{ k: 2; z: 3 }> }>,
      readonly ['u', 'k']
    >,
    1 | 2
  >('=');

  // A member of a union that does not have the rest of the path holds nothing there.
  expectType<
    RecordValueAtPath<
      Readonly<{ u: Readonly<{ k: 1 }> | Readonly<{ k: 2; z: 3 }> }>,
      readonly ['u', 'z']
    >,
    3 | undefined
  >('=');

  expectType<
    RecordValueAtPath<
      Readonly<{ p: Readonly<{ x: 1 }> | 'none' }>,
      readonly ['p', 'x']
    >,
    1 | undefined
  >('=');

  expectType<
    RecordValueAtPath<
      Readonly<{ u: Readonly<{ k: 1 }> | Readonly<{ k: Readonly<{ x: 2 }> }> }>,
      readonly ['u', 'k', 'x']
    >,
    2 | undefined
  >('=');

  expectType<
    RecordValueAtPath<
      Readonly<{ a: Readonly<{ b: readonly [string, boolean] }> }>,
      readonly ['a', 'b', 0]
    >,
    string
  >('=');

  expectType<
    RecordValueAtPathWithIndex<
      Readonly<{ a?: Readonly<{ c: readonly number[] }> }>,
      readonly ['a', 'c', number]
    >,
    number | undefined
  >('=');

  expectType<
    RecordValueAtPathWithIndex<
      Readonly<{ n: Readonly<{ x: 1 }> | null }>,
      readonly ['n', 'x']
    >,
    1 | undefined
  >('=');

  expectType<
    RecordValueAtPathWithIndex<
      Readonly<{ u: Readonly<{ k: 1 }> | Readonly<{ k: 2; z: 3 }> }>,
      readonly ['u', 'z']
    >,
    3 | undefined
  >('=');

  expectType<
    RecordValueAtPathWithIndex<
      Readonly<{ u: Readonly<{ k: 1 }> | Readonly<{ k: Readonly<{ x: 2 }> }> }>,
      readonly ['u', 'k', 'x']
    >,
    2 | undefined
  >('=');

  expectType<
    RecordValueAtPathWithIndex<
      Readonly<{ r: Readonly<Record<string, 1>> }>,
      readonly ['r', string]
    >,
    1 | undefined
  >('=');

  expectType<
    RecordValueAtPathWithIndex<
      Readonly<{ a: Readonly<{ b: readonly string[] }> }>,
      readonly ['a', 'b', number]
    >,
    string | undefined
  >('=');

  expectType<
    RecordPathAndValueTypeTuple<Readonly<{ a?: Readonly<{ c: 1 }> }>>,
    | readonly [readonly [], Readonly<{ a?: Readonly<{ c: 1 }> }>]
    | readonly [readonly ['a'], Readonly<{ c: 1 }> | undefined]
    | readonly [readonly ['a', 'c'], 1 | undefined]
  >('=');

  type U = Readonly<{ u: Readonly<{ k: 1 }> | Readonly<{ k: 2; z: 3 }> }>;

  expectType<
    RecordPathAndValueTypeTuple<U>,
    | readonly [readonly [], U]
    | readonly [readonly ['u'], Readonly<{ k: 1 }> | Readonly<{ k: 2; z: 3 }>]
    | readonly [readonly ['u', 'k'], 1 | 2]
    | readonly [readonly ['u', 'z'], 3 | undefined]
  >('=');
}
