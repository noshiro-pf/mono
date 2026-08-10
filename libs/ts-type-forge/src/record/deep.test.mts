import { type ExecOptions } from 'node:child_process';
import { expectType } from 'ts-data-forge';
import {
  type BoundedLengthArray,
  type Brand,
  type FixedLengthArray,
  type HasLengthConstraint,
  type MaxLengthArray,
  type MaxLengthOf,
  type MinLengthArray,
  type MinLengthOf,
} from '../branded-types/index.mjs';
import { type UnknownRecord } from '../constants/index.mjs';
import { type MutableMap, type MutableSet } from '../others/index.mjs';
import {
  type DeepMutable,
  type DeepPartial,
  type DeepReadonly,
  type DeepRequired,
} from './deep.mjs';

// Base types for testing
type Base = Readonly<{
  a: number;
  b: string | undefined;
  c: Readonly<{
    d: boolean;
    e: readonly number[];
    f?: string;
    g: ReadonlyMap<string, number>;
    h: ReadonlySet<boolean>;
  }>;
  i: readonly [number, string, Readonly<{ j: bigint }>];
  k: (x: number) => string;
  l: null;
}>;

type ReadonlyBase = Readonly<{
  a: number;
  b: string | undefined;
  c: Readonly<{
    d: boolean;
    e: readonly number[];
    f?: string;
    g: ReadonlyMap<string, number>;
    h: ReadonlySet<boolean>;
  }>;
  i: readonly [number, string, Readonly<{ j: bigint }>];
  k: (x: number) => string;
  l: null;
}>;

type PartialBase = Readonly<{
  a?: number;
  b?: string | undefined;
  c?:
    | undefined
    | Readonly<{
        d?: boolean;
        e?: readonly (number | undefined)[];
        f?: string;
        g?: ReadonlyMap<string, number>;
        h?: ReadonlySet<boolean>;
      }>;
  i?: readonly [number?, string?, Readonly<{ j?: bigint }>?];
  k?: (x: number) => string;
  l?: null;
}>;

type RequiredBase = Readonly<{
  a: number;
  b: string | undefined;
  c: Readonly<{
    d: boolean;
    e: readonly number[];
    f: string; // optional removed
    g: ReadonlyMap<string, number>; // undefined removed from value
    h: ReadonlySet<boolean>; // undefined removed from value
  }>;
  i: readonly [number, string, Readonly<{ j: bigint }>]; // undefined removed from elements/objects
  k: (x: number) => string;
  l: null;
}>;

// --- DeepReadonly ---
{
  // Primitives
  expectType<string, string>('=');

  expectType<number, number>('=');

  expectType<boolean, boolean>('=');

  expectType<null, null>('=');

  expectType<undefined, undefined>('=');

  expectType<symbol, symbol>('=');

  expectType<bigint, bigint>('=');

  // Function
  expectType<DeepReadonly<(a: number) => string>, (a: number) => string>('=');

  // Simple Object
  expectType<DeepReadonly<{ a: number }>, Readonly<{ a: number }>>('=');

  // Simple Array
  expectType<readonly string[], readonly string[]>('=');

  // Simple Tuple
  expectType<readonly [number, string], readonly [number, string]>('=');

  // Simple Map
  expectType<
    DeepReadonly<ReadonlyMap<string, number>>,
    ReadonlyMap<string, number>
  >('=');

  // Simple Set
  expectType<DeepReadonly<ReadonlySet<string>>, ReadonlySet<string>>('=');

  // Complex Type
  expectType<DeepReadonly<Base>, ReadonlyBase>('=');

  // Already Readonly
  expectType<DeepReadonly<ReadonlyBase>, ReadonlyBase>('=');

  expectType<
    Pick<
      DeepReadonly<ExecOptions & { silent?: boolean }>,
      | 'shell'
      | 'signal'
      | 'maxBuffer'
      | 'killSignal'
      | 'windowsHide'
      | 'timeout'
      | 'uid'
      | 'gid'
      | 'cwd'
      | 'env'
      | 'silent'
    >,
    Readonly<{
      shell?: string | undefined;
      signal?: DeepReadonly<AbortSignal> | undefined;
      maxBuffer?: number | undefined;
      killSignal?: DeepReadonly<NodeJS.Signals> | number | undefined;

      // CommonOptions
      windowsHide?: boolean | undefined;
      timeout?: number | undefined;

      // ProcessEnvOptions
      uid?: number | undefined;
      gid?: number | undefined;
      cwd?: string | undefined | DeepReadonly<URL>;
      env?: DeepReadonly<NodeJS.ProcessEnv> | undefined;

      silent?: boolean;
    }>
  >('=');
}

// --- DeepMutable ---
{
  // Primitives
  expectType<DeepMutable<string>, string>('=');

  expectType<DeepMutable<number>, number>('=');

  expectType<DeepMutable<boolean>, boolean>('=');

  expectType<DeepMutable<null>, null>('=');

  expectType<DeepMutable<undefined>, undefined>('=');

  expectType<DeepMutable<symbol>, symbol>('=');

  expectType<DeepMutable<bigint>, bigint>('=');

  // Function
  expectType<DeepMutable<(a: number) => string>, (a: number) => string>('=');

  // Simple Readonly Object
  expectType<DeepMutable<Readonly<{ a: number }>>, Readonly<{ a: number }>>(
    '=',
  );

  // Simple Readonly Array
  expectType<DeepMutable<readonly string[]>, readonly string[]>('=');

  // Simple Readonly Tuple
  expectType<DeepMutable<readonly [number, string]>, readonly [number, string]>(
    '=',
  );

  // Simple Readonly Map
  expectType<
    DeepMutable<ReadonlyMap<string, number>>,
    ReadonlyMap<string, number>
  >('=');

  // Simple Readonly Set
  expectType<DeepMutable<ReadonlySet<string>>, ReadonlySet<string>>('=');

  // Complex Readonly Type
  expectType<DeepMutable<ReadonlyBase>, Base>('=');

  // Already Mutable
  expectType<DeepMutable<Base>, Base>('=');
}

// --- DeepPartial ---
{
  // Primitives
  expectType<DeepPartial<string>, string>('=');

  expectType<DeepPartial<number>, number>('=');

  expectType<DeepPartial<boolean>, boolean>('=');

  expectType<DeepPartial<null>, null>('=');

  expectType<DeepPartial<undefined>, undefined>('=');

  expectType<DeepPartial<symbol>, symbol>('=');

  expectType<DeepPartial<bigint>, bigint>('=');

  // Function
  expectType<DeepPartial<(a: number) => string>, (a: number) => string>('=');

  // Simple Object
  expectType<
    DeepPartial<Readonly<{ a: number }>>,
    Readonly<{ a?: number | undefined }>
  >('=');

  // Simple Array
  expectType<DeepPartial<readonly string[]>, readonly (string | undefined)[]>(
    '=',
  ); // Note: Array itself can become undefined

  // Simple Tuple
  expectType<
    DeepPartial<readonly [number, string]>,
    readonly [(number | undefined)?, (string | undefined)?] // Note: Tuple itself can become undefined
  >('=');

  // Simple Map
  expectType<
    DeepPartial<ReadonlyMap<string, number>>,
    MutableMap<string, number> // Note: Map itself can become undefined
  >('=');

  // Simple Set
  expectType<
    DeepPartial<ReadonlySet<string>>,
    MutableSet<string> // Note: Set itself can become undefined
  >('=');

  // Complex Type

  expectType<DeepPartial<Base>, PartialBase>('=');

  expectType<DeepPartial<PartialBase>, PartialBase>('=');

  expectType<DeepPartial<RequiredBase>, PartialBase>('=');
}

// --- DeepRequired ---
{
  // Primitives
  expectType<DeepRequired<string>, string>('=');

  expectType<DeepRequired<number>, number>('=');

  expectType<DeepRequired<boolean>, boolean>('=');

  expectType<DeepRequired<null>, null>('=');

  expectType<DeepRequired<undefined>, undefined>('='); // Note: undefined remains undefined

  expectType<DeepRequired<symbol>, symbol>('=');

  expectType<DeepRequired<bigint>, bigint>('=');

  // Function
  expectType<DeepRequired<(a: number) => string>, (a: number) => string>('=');

  // Simple Object with optional
  expectType<DeepRequired<Readonly<{ a?: number }>>, Readonly<{ a: number }>>(
    '=',
  );

  expectType<DeepRequired<Readonly<{ a?: number }>>, Readonly<{ a: number }>>(
    '=',
  );

  expectType<
    DeepRequired<Readonly<{ a: number | undefined }>>,
    Readonly<{ a: number | undefined }>
  >('=');

  // Simple Array with optional elements (not directly possible, but via object)
  expectType<
    DeepRequired<Readonly<{ a?: readonly (string | undefined)[] }>>,
    Readonly<{ a: readonly string[] }> // Array elements become required, array itself becomes required
  >('=');

  // Simple Tuple with optional elements
  expectType<
    DeepRequired<readonly [number?, string?]>,
    readonly [number, string] // Tuple elements become required
  >('=');

  expectType<
    DeepRequired<readonly [number | undefined, string | undefined]>,
    readonly [number | undefined, string | undefined]
  >('=');

  expectType<
    DeepRequired<readonly [number?, string?]>,
    readonly [number, string]
  >('=');

  // Simple Map with optional values (not directly possible, but via object)
  expectType<
    DeepRequired<Readonly<{ a?: ReadonlyMap<string, number | undefined> }>>,
    Readonly<{ a: ReadonlyMap<string, number | undefined> }> // Map value becomes required, Map itself becomes required
  >('=');

  // Simple Set with optional values (not directly possible, but via object)
  expectType<
    DeepRequired<Readonly<{ a?: ReadonlySet<string | undefined> }>>,
    Readonly<{ a: ReadonlySet<string | undefined> }> // Set value becomes required, Set itself becomes required
  >('=');

  // Complex Type with optional/undefined
  expectType<DeepRequired<Base>, RequiredBase>('=');

  // NOTE: Required<{ x: string | undefined }> becomes { x: string | undefined }
  // but Required<{ x?: string | undefined }> becomes { x: string }
  expectType<DeepRequired<Omit<PartialBase, 'b'>>, Omit<RequiredBase, 'b'>>(
    '=',
  );
}

/* Length-constrained arrays.

   These are an intersection of a tuple and a brand object, which TypeScript
   does not treat as an array type, so the homomorphic mapped type the four
   transforms use for records maps `length`, the `Array.prototype` methods and
   the brand keys and yields a non-array object. Each transform now rebuilds an
   array instead and carries the brand over. */
{
  // The result is an array again, with the element type transformed.
  expectType<
    DeepReadonly<MinLengthArray<3, { a: number[] }>>[number],
    Readonly<{ a: readonly number[] }>
  >('=');

  expectType<
    DeepReadonly<FixedLengthArray<3, { a: number[] }>>[number],
    Readonly<{ a: readonly number[] }>
  >('=');

  expectType<
    DeepReadonly<BoundedLengthArray<2, 5, { a: number[] }>>[number],
    Readonly<{ a: readonly number[] }>
  >('=');

  expectType<
    DeepReadonly<MaxLengthArray<5, { a: number[] }>>[number],
    Readonly<{ a: readonly number[] }>
  >('=');

  // The brand is carried over, so the constraint is still readable.
  expectType<
    HasLengthConstraint<DeepReadonly<MinLengthArray<3, number>>>,
    true
  >('=');

  expectType<MinLengthOf<DeepReadonly<MinLengthArray<3, number>>>, 3>('=');

  expectType<MaxLengthOf<DeepReadonly<MaxLengthArray<5, number>>>, 5>('=');

  /* The structural minimum-length prefix is *not* rebuilt, so the result is
     strictly wider than the corresponding family member: recovering the bounds
     costs one instantiation per unit of the bound, which is affordable for a
     single array but not for every array a deep transform reaches. Use
     `ChangeArrayElement` directly when one array needs the exact shape. */
  expectType<
    DeepReadonly<MinLengthArray<3, { a: number[] }>>,
    MinLengthArray<3, Readonly<{ a: readonly number[] }>>
  >('>=');

  // Nested under a record, which is where the breakage used to spread.
  expectType<
    DeepReadonly<{ xs: MinLengthArray<2, { a: number[] }> }>['xs'][number],
    Readonly<{ a: readonly number[] }>
  >('=');

  /* `DeepMutable` deep-mutates the element type but leaves the array itself
     readonly: the family's structural part is a readonly tuple, so a mutable
     array carrying a length-constraint brand is not expressible at all. */
  expectType<
    DeepMutable<MinLengthArray<3, { a: readonly number[] }>>[number],
    Readonly<{ a: readonly number[] }>
  >('=');

  expectType<HasLengthConstraint<DeepMutable<MinLengthArray<3, number>>>, true>(
    '=',
  );

  expectType<
    DeepPartial<MinLengthArray<2, { a: number }>>[number],
    Readonly<{ a?: number }>
  >('=');

  expectType<
    DeepRequired<MinLengthArray<2, { a?: number }>>[number],
    Readonly<{ a: number }>
  >('=');

  // An array intersected with a hand-written brand fails the same way, and is
  // covered by the same path.
  expectType<
    DeepReadonly<{ a: number[] }[] & Brand<unknown, 'Tag'>>,
    readonly Readonly<{ a: readonly number[] }>[] & Brand<unknown, 'Tag'>
  >('~=');
}

/* Plain arrays and tuples keep mapping exactly as before: element positions
   stay distinct, a plain array stays a plain array, and a mutable array is not
   mistaken for a brand-carrying one. */
{
  expectType<
    DeepReadonly<[{ a: number[] }, { b: string[] }]>,
    readonly [
      Readonly<{ a: readonly number[] }>,
      Readonly<{ b: readonly string[] }>,
    ]
  >('=');

  expectType<
    DeepReadonly<{ a: number[] }[]>,
    readonly Readonly<{ a: readonly number[] }>[]
  >('=');

  expectType<
    DeepReadonly<{ a: number[] }[]>,
    readonly Readonly<{ a: readonly number[] }>[]
  >('=');

  expectType<readonly [], readonly []>('=');

  expectType<readonly [], readonly []>('=');

  expectType<
    DeepMutable<readonly [Readonly<{ a: readonly number[] }>]>,
    readonly [Readonly<{ a: readonly number[] }>]
  >('=');
}

/*
 * Regression guard for `AnyRecord`, the "plain object" branch guard shared by
 * every `Deep*` (see the note on it in `deep.mts`).
 *
 * Tightening its `ReadonlyRecord<string, any>` to `UnknownRecord` makes every
 * `Deep*` return any type without an implicit index signature completely
 * untransformed. Each assertion below fails if that happens.
 */
{
  // Class instance types are the fixture on purpose — they are the shape that
  // gets no implicit index signature and survives this repo's autofixes. Do
  // not "simplify" them into object type aliases: those do get one, and the
  // assertions would then pass under either spelling. (`interface` works too
  // in principle, but `consistent-type-definitions` rewrites it into an alias.)
  class Mut {
    readonly x: number = 0;
    readonly y: readonly string[] = [];
  }

  class Frozen {
    readonly x: number = 0;
    readonly y: readonly number[] = [];
  }

  class Opt {
    readonly x?: number;
  }

  // Fixture integrity: were these to gain an index signature, every assertion
  // below would stop testing anything.
  expectType<Mut extends UnknownRecord ? true : false, false>('=');

  expectType<Frozen extends UnknownRecord ? true : false, false>('=');

  expectType<Opt extends UnknownRecord ? true : false, false>('=');

  // Such a type is transformed, not returned as-is.
  expectType<DeepReadonly<Mut>, Readonly<{ x: number; y: readonly string[] }>>(
    '=',
  );

  expectType<
    DeepMutable<Frozen>,
    Readonly<{ x: number; y: readonly number[] }>
  >('=');

  expectType<
    DeepPartial<Mut>,
    Readonly<{
      x?: number | undefined;
      y?: readonly (string | undefined)[] | undefined;
    }>
  >('=');

  expectType<DeepRequired<Opt>, Readonly<{ x: number }>>('=');

  // The same holds when it is reached through recursion.
  expectType<
    DeepReadonly<{ a: Mut }>,
    Readonly<{ a: Readonly<{ x: number; y: readonly string[] }> }>
  >('=');
}
