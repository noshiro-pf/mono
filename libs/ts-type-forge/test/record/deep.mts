import { type ExecOptions } from 'node:child_process';
import { expectType } from '../expect-type.mjs';

// Base types for testing
type Base = {
  a: number;
  b: string | undefined;
  c: {
    d: boolean;
    e: number[];
    f?: string;
    g: Map<string, number>;
    h: Set<boolean>;
  };
  i: [number, string, { j: bigint }];
  k: (x: number) => string;
  l: null;
};

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

type PartialBase = {
  a?: number;
  b?: string | undefined;
  c?:
    | {
        d?: boolean;
        e?: (number | undefined)[];
        f?: string;
        g?: Map<string, number>;
        h?: Set<boolean>;
      }
    | undefined;
  i?: [number?, string?, { j?: bigint }?];
  k?: (x: number) => string;
  l?: null;
};

type RequiredBase = {
  a: number;
  b: string | undefined;
  c: {
    d: boolean;
    e: number[];
    f: string; // optional removed
    g: Map<string, number>; // undefined removed from value
    h: Set<boolean>; // undefined removed from value
  };
  i: [number, string, { j: bigint }]; // undefined removed from elements/objects
  k: (x: number) => string;
  l: null;
};

// --- DeepReadonly ---
{
  // Primitives
  expectType<DeepReadonly<string>, string>('=');
  expectType<DeepReadonly<number>, number>('=');
  expectType<DeepReadonly<boolean>, boolean>('=');
  expectType<DeepReadonly<null>, null>('=');
  expectType<DeepReadonly<undefined>, undefined>('=');
  expectType<DeepReadonly<symbol>, symbol>('=');
  expectType<DeepReadonly<bigint>, bigint>('=');

  // Function
  expectType<DeepReadonly<(a: number) => string>, (a: number) => string>('=');

  // Simple Object
  expectType<DeepReadonly<{ a: number }>, Readonly<{ a: number }>>('=');

  // Simple Array
  expectType<DeepReadonly<string[]>, readonly string[]>('=');

  // Simple Tuple
  expectType<DeepReadonly<[number, string]>, readonly [number, string]>('=');

  // Simple Map
  expectType<DeepReadonly<Map<string, number>>, ReadonlyMap<string, number>>(
    '=',
  );

  // Simple Set
  expectType<DeepReadonly<Set<string>>, ReadonlySet<string>>('=');

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
      cwd?: string | DeepReadonly<URL> | undefined;
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
  expectType<DeepMutable<Readonly<{ a: number }>>, { a: number }>('=');

  // Simple Readonly Array
  expectType<DeepMutable<readonly string[]>, string[]>('=');

  // Simple Readonly Tuple
  expectType<DeepMutable<readonly [number, string]>, [number, string]>('=');

  // Simple Readonly Map
  expectType<DeepMutable<ReadonlyMap<string, number>>, Map<string, number>>(
    '=',
  );

  // Simple Readonly Set
  expectType<DeepMutable<ReadonlySet<string>>, Set<string>>('=');

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
  expectType<DeepPartial<{ a: number }>, { a?: number | undefined }>('=');

  // Simple Array
  expectType<DeepPartial<string[]>, (string | undefined)[]>('='); // Note: Array itself can become undefined

  // Simple Tuple
  expectType<
    DeepPartial<[number, string]>,
    [(number | undefined)?, (string | undefined)?] // Note: Tuple itself can become undefined
  >('=');

  // Simple Map
  expectType<
    DeepPartial<Map<string, number>>,
    MutableMap<string, number> // Note: Map itself can become undefined
  >('=');

  // Simple Set
  expectType<
    DeepPartial<Set<string>>,
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
  expectType<DeepRequired<{ a?: number }>, { a: number }>('=');
  expectType<DeepRequired<{ a?: number }>, { a: number }>('=');
  expectType<
    DeepRequired<{ a: number | undefined }>,
    { a: number | undefined }
  >('=');

  // Simple Array with optional elements (not directly possible, but via object)
  expectType<
    DeepRequired<{ a?: (string | undefined)[] }>,
    { a: string[] } // Array elements become required, array itself becomes required
  >('=');

  // Simple Tuple with optional elements
  expectType<
    DeepRequired<[number?, string?]>,
    [number, string] // Tuple elements become required
  >('=');

  expectType<
    DeepRequired<[number | undefined, string | undefined]>,
    [number | undefined, string | undefined]
  >('=');

  expectType<DeepRequired<[number?, string?]>, [number, string]>('=');

  // Simple Map with optional values (not directly possible, but via object)
  expectType<
    DeepRequired<{ a?: Map<string, number | undefined> }>,
    { a: Map<string, number | undefined> } // Map value becomes required, Map itself becomes required
  >('=');

  // Simple Set with optional values (not directly possible, but via object)
  expectType<
    DeepRequired<{ a?: Set<string | undefined> }>,
    { a: Set<string | undefined> } // Set value becomes required, Set itself becomes required
  >('=');

  // Complex Type with optional/undefined
  expectType<DeepRequired<Base>, RequiredBase>('=');

  // NOTE: Required<{ x: string | undefined }> becomes { x: string | undefined }
  // but Required<{ x?: string | undefined }> becomes { x: string }
  expectType<DeepRequired<Omit<PartialBase, 'b'>>, Omit<RequiredBase, 'b'>>(
    '=',
  );
}
