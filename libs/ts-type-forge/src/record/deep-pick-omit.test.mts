import { expectType } from 'ts-data-forge';
import { type UnknownRecord } from '../constants/index.mjs';
import { type RelaxedPick } from '../others/index.mjs';
import { type DeepOmit, type DeepPick } from './deep-pick-omit.mjs';

// --- DeepPick ---
{
  // Basic nested pick
  expectType<
    DeepPick<
      Readonly<{ a: Readonly<{ b: Readonly<{ c: number; d: number }> }> }>,
      readonly ['a', 'b', 'c']
    >,
    Readonly<{ a: Readonly<{ b: Readonly<{ c: number }> }> }>
  >('=');

  // Pick at depth 1
  expectType<
    DeepPick<Readonly<{ a: number; b: string }>, readonly ['a']>,
    Readonly<{ a: number }>
  >('=');

  // Pick at depth 1
  expectType<
    DeepPick<
      Readonly<{ a: Readonly<{ b: number; c: string }> }>,
      readonly ['a']
    >,
    Readonly<{ a: Readonly<{ b: number; c: string }> }>
  >('=');

  // Pick at depth 2
  expectType<
    DeepPick<
      Readonly<{ a: Readonly<{ b: number; c: string }>; d: boolean }>,
      readonly ['a', 'b']
    >,
    Readonly<{ a: Readonly<{ b: number }> }>
  >('=');

  // Pick preserves the full path structure
  expectType<
    DeepPick<
      Readonly<{
        a: Readonly<{ b: Readonly<{ c: number; d: string }>; e: boolean }>;
        f: number;
      }>,
      readonly ['a', 'b', 'd']
    >,
    Readonly<{ a: Readonly<{ b: Readonly<{ d: string }> }> }>
  >('=');

  // Multiple picks via union of paths
  expectType<
    DeepPick<
      Readonly<{
        a: Readonly<{ b: number; c: string; d: boolean }>;
        e: boolean;
      }>,
      readonly ['a', 'b'] | readonly ['a', 'c']
    >,
    Readonly<{ a: Readonly<{ b: number; c: string }> }>
  >('=');

  // Multiple picks at different depths
  expectType<
    DeepPick<
      Readonly<{ a: Readonly<{ b: Readonly<{ c: number }> }>; d: string }>,
      readonly ['a', 'b', 'c'] | readonly ['d']
    >,
    Readonly<{ a: Readonly<{ b: Readonly<{ c: number }> }>; d: string }>
  >('=');

  // Single key path (depth 1)
  expectType<
    DeepPick<Readonly<{ x: number; y: string; z: boolean }>, readonly ['x']>,
    Readonly<{ x: number }>
  >('=');

  // Optional properties
  expectType<
    DeepPick<
      Readonly<{ a?: Readonly<{ b: number; c: string }> }>,
      readonly ['a', 'b']
    >,
    Readonly<{ a?: Readonly<{ b: number }> }>
  >('=');

  // Readonly properties
  expectType<
    DeepPick<
      Readonly<{ a: Readonly<{ b: number; c: string }> }>,
      readonly ['a', 'b']
    >,
    Readonly<{ a: Readonly<{ b: number }> }>
  >('=');

  // Prefix path: shorter path picks entire subtree
  expectType<
    DeepPick<
      Readonly<{ a: Readonly<{ b: number; c: string }> }>,
      readonly ['a'] | readonly ['a', 'b']
    >,
    Readonly<{ a: Readonly<{ b: number; c: string }> }>
  >('=');

  // Prefix path at deeper level
  expectType<
    DeepPick<
      Readonly<{
        a: Readonly<{ b: Readonly<{ c: number; d: string }>; e: boolean }>;
      }>,
      readonly ['a', 'b'] | readonly ['a', 'b', 'c']
    >,
    Readonly<{ a: Readonly<{ b: Readonly<{ c: number; d: string }> }> }>
  >('=');

  // Prefix path: short path skipping 2 levels
  expectType<
    DeepPick<
      Readonly<{ a: Readonly<{ b: Readonly<{ c: number; d: string }> }> }>,
      readonly ['a'] | readonly ['a', 'b', 'c']
    >,
    Readonly<{ a: Readonly<{ b: Readonly<{ c: number; d: string }> }> }>
  >('=');

  // Prefix path with multiple longer paths
  expectType<
    DeepPick<
      Readonly<{ a: Readonly<{ b: number; c: string; d: boolean }> }>,
      readonly ['a'] | readonly ['a', 'b'] | readonly ['a', 'c']
    >,
    Readonly<{ a: Readonly<{ b: number; c: string; d: boolean }> }>
  >('=');

  // Prefix path on different keys simultaneously
  expectType<
    DeepPick<
      Readonly<{
        a: Readonly<{ b: number; c: string }>;
        d: Readonly<{ e: number; f: string }>;
      }>,
      readonly ['a'] | readonly ['d', 'e']
    >,
    Readonly<{
      a: Readonly<{ b: number; c: string }>;
      d: Readonly<{ e: number }>;
    }>
  >('=');

  // Prefix path with optional property
  expectType<
    DeepPick<
      Readonly<{ a?: Readonly<{ b: number; c: string }> }>,
      readonly ['a'] | readonly ['a', 'b']
    >,
    Readonly<{ a?: Readonly<{ b: number; c: string }> }>
  >('=');

  // Path through non-record: leaf pick returns the primitive value
  expectType<
    DeepPick<Readonly<{ a: number }>, readonly ['a']>,
    Readonly<{ a: number }>
  >('=');

  // Path through primitive: consistent with RelaxedPick (non-existent key → {})
  expectType<
    DeepPick<Readonly<{ a: number }>, readonly ['a', 'b']>,
    Readonly<{ a: NonNullable<unknown> }>
  >('=');

  // Path through primitive with method name: still {} (primitives are opaque)
  expectType<
    DeepPick<Readonly<{ a: number }>, readonly ['a', 'toString']>,
    Readonly<{ a: NonNullable<unknown> }>
  >('=');

  // Non-existent nested key on record: consistent with RelaxedPick
  expectType<
    DeepPick<Readonly<{ a: Readonly<{ b: number }> }>, readonly ['a', 'x']>,
    Readonly<{ a: NonNullable<unknown> }>
  >('=');

  // Non-existent top-level key: consistent with RelaxedPick
  expectType<
    DeepPick<Readonly<{ a: number }>, readonly ['x']>,
    NonNullable<unknown>
  >('=');

  // Union input: distributes over each member
  expectType<
    DeepPick<
      Readonly<{ a: number; b: string } | { a: boolean; c: number }>,
      readonly ['a']
    >,
    Readonly<{ a: number } | { a: boolean }>
  >('=');

  // Union input: nested
  expectType<
    DeepPick<
      Readonly<
        | { a: Readonly<{ b: number; c: string }> }
        | { a: Readonly<{ b: boolean; d: number }> }
      >,
      readonly ['a', 'b']
    >,
    Readonly<{ a: Readonly<{ b: number }> } | { a: Readonly<{ b: boolean }> }>
  >('=');

  // Union input: members with disjoint keys
  expectType<
    DeepPick<Readonly<{ a: number } | { b: string }>, readonly ['a']>,
    NonNullable<unknown> | Readonly<{ a: number }>
  >('=');

  // Reference: picking a non-existent key produces an empty object type
  expectType<RelaxedPick<Readonly<{ b: number }>, 'a'>, {}>('=');

  // Union input with union paths
  expectType<
    DeepPick<
      Readonly<
        | { a: Readonly<{ b: number; c: string }> }
        | { a: Readonly<{ b: boolean; d: number }>; e: string }
      >,
      readonly ['a', 'b'] | readonly ['e']
    >,
    Readonly<
      | { a: Readonly<{ b: number }> }
      | { a: Readonly<{ b: boolean }>; e: string }
    >
  >('=');

  // Intersection input: pick from flattened shape
  expectType<
    DeepPick<Readonly<{ a: number } & { b: string }>, readonly ['a']>,
    Readonly<{ a: number }>
  >('=');

  // Intersection input: nested
  expectType<
    DeepPick<
      Readonly<{ a: Readonly<{ b: number; c: string }> } & { d: boolean }>,
      readonly ['a', 'b']
    >,
    Readonly<{ a: Readonly<{ b: number }> }>
  >('=');

  // Intersection input: overlapping keys narrow the value
  expectType<
    DeepPick<
      Readonly<
        { a: Readonly<{ b: number; c: string }> } & {
          a: Readonly<{ b: 1; d: boolean }>;
        }
      >,
      readonly ['a', 'b']
    >,
    Readonly<{ a: Readonly<{ b: 1 }> }>
  >('=');

  // Intersection input with union paths
  expectType<
    DeepPick<
      Readonly<{ a: Readonly<{ b: number; c: string }> } & { d: boolean }>,
      readonly ['a', 'b'] | readonly ['d']
    >,
    Readonly<{ a: Readonly<{ b: number }>; d: boolean }>
  >('=');
}

// --- DeepOmit ---
{
  // Basic nested omit
  expectType<
    DeepOmit<
      Readonly<{ a: Readonly<{ b: Readonly<{ c: number; d: number }> }> }>,
      readonly ['a', 'b', 'c']
    >,
    Readonly<{ a: Readonly<{ b: Readonly<{ d: number }> }> }>
  >('=');

  // Omit at depth 1
  expectType<
    DeepOmit<Readonly<{ a: number; b: string }>, readonly ['a']>,
    Readonly<{ b: string }>
  >('=');

  // Omit at depth 2
  expectType<
    DeepOmit<
      Readonly<{ a: Readonly<{ b: number; c: string }>; d: boolean }>,
      readonly ['a', 'b']
    >,
    Readonly<{ a: Readonly<{ c: string }>; d: boolean }>
  >('=');

  // Omit preserves the full structure except the target
  expectType<
    DeepOmit<
      Readonly<{
        a: Readonly<{ b: Readonly<{ c: number; d: string }>; e: boolean }>;
        f: number;
      }>,
      readonly ['a', 'b', 'c']
    >,
    Readonly<{
      a: Readonly<{ b: Readonly<{ d: string }>; e: boolean }>;
      f: number;
    }>
  >('=');

  // Multiple omits via union of paths
  expectType<
    DeepOmit<
      Readonly<{ a: Readonly<{ b: number; c: string; d: boolean }> }>,
      readonly ['a', 'b'] | readonly ['a', 'c']
    >,
    Readonly<{ a: Readonly<{ d: boolean }> }>
  >('=');

  // Multiple omits at different depths
  expectType<
    DeepOmit<
      Readonly<{
        a: Readonly<{ b: Readonly<{ c: number }>; d: string }>;
        e: boolean;
      }>,
      readonly ['a', 'b', 'c'] | readonly ['e']
    >,
    Readonly<{ a: Readonly<{ b: NonNullable<unknown>; d: string }> }>
  >('=');

  // Single key path (depth 1)
  expectType<
    DeepOmit<Readonly<{ x: number; y: string; z: boolean }>, readonly ['x']>,
    Readonly<{ y: string; z: boolean }>
  >('=');

  // Optional properties
  expectType<
    DeepOmit<
      Readonly<{ a?: Readonly<{ b: number; c: string }> }>,
      readonly ['a', 'b']
    >,
    Readonly<{ a?: Readonly<{ c: string }> }>
  >('=');

  // Readonly properties
  expectType<
    DeepOmit<
      Readonly<{ a: Readonly<{ b: number; c: string }> }>,
      readonly ['a', 'b']
    >,
    Readonly<{ a: Readonly<{ c: string }> }>
  >('=');

  // Prefix path: shorter path removes entire subtree
  expectType<
    DeepOmit<
      Readonly<{ a: Readonly<{ b: number; c: string }>; d: boolean }>,
      readonly ['a'] | readonly ['a', 'b']
    >,
    Readonly<{ d: boolean }>
  >('=');

  // Prefix path at deeper level
  expectType<
    DeepOmit<
      Readonly<{
        a: Readonly<{ b: Readonly<{ c: number; d: string }>; e: boolean }>;
      }>,
      readonly ['a', 'b'] | readonly ['a', 'b', 'c']
    >,
    Readonly<{ a: Readonly<{ e: boolean }> }>
  >('=');

  // Prefix path: short path skipping 2 levels
  expectType<
    DeepOmit<
      Readonly<{
        a: Readonly<{ b: Readonly<{ c: number; d: string }> }>;
        e: boolean;
      }>,
      readonly ['a'] | readonly ['a', 'b', 'c']
    >,
    Readonly<{ e: boolean }>
  >('=');

  // Prefix path with multiple longer paths
  expectType<
    DeepOmit<
      Readonly<{
        a: Readonly<{ b: number; c: string; d: boolean }>;
        e: number;
      }>,
      readonly ['a'] | readonly ['a', 'b'] | readonly ['a', 'c']
    >,
    Readonly<{ e: number }>
  >('=');

  // Prefix path on different keys simultaneously
  expectType<
    DeepOmit<
      Readonly<{
        a: Readonly<{ b: number; c: string }>;
        d: Readonly<{ e: number; f: string }>;
      }>,
      readonly ['a'] | readonly ['d', 'e']
    >,
    Readonly<{ d: Readonly<{ f: string }> }>
  >('=');

  // Prefix path with optional property
  expectType<
    DeepOmit<
      Readonly<{ a?: Readonly<{ b: number; c: string }>; d: boolean }>,
      readonly ['a'] | readonly ['a', 'b']
    >,
    Readonly<{ d: boolean }>
  >('=');

  // Path through non-record: primitives are opaque, T unchanged
  expectType<
    DeepOmit<Readonly<{ a: number; b: string }>, readonly ['a', 'toString']>,
    Readonly<{ a: number; b: string }>
  >('=');

  // Path through primitive with non-existent key: T unchanged
  expectType<
    DeepOmit<Readonly<{ a: number; b: string }>, readonly ['a', 'x']>,
    Readonly<{ a: number; b: string }>
  >('=');

  // Non-existent top-level key: T unchanged
  expectType<
    DeepOmit<Readonly<{ a: number; b: string }>, readonly ['x']>,
    Readonly<{ a: number; b: string }>
  >('=');

  // Non-existent nested key on record: T unchanged
  expectType<
    DeepOmit<Readonly<{ a: Readonly<{ b: number }> }>, readonly ['a', 'x']>,
    Readonly<{ a: Readonly<{ b: number }> }>
  >('=');

  // Union input: distributes over each member
  expectType<
    DeepOmit<
      Readonly<{ a: number; b: string } | { a: boolean; c: number }>,
      readonly ['a']
    >,
    Readonly<{ b: string } | { c: number }>
  >('=');

  // Union input: nested
  expectType<
    DeepOmit<
      Readonly<
        | { a: Readonly<{ b: number; c: string }> }
        | { a: Readonly<{ b: boolean; d: number }> }
      >,
      readonly ['a', 'b']
    >,
    Readonly<{ a: Readonly<{ c: string }> } | { a: Readonly<{ d: number }> }>
  >('=');

  // Union input: members with different nested shapes
  expectType<
    DeepOmit<
      Readonly<
        | { a: Readonly<{ x: number; y: string }> }
        | { a: Readonly<{ x: boolean }>; b: number }
      >,
      readonly ['a', 'x']
    >,
    Readonly<
      { a: Readonly<{ y: string }> } | { a: NonNullable<unknown>; b: number }
    >
  >('=');

  // Intersection input: omit from flattened shape
  expectType<
    DeepOmit<Readonly<{ a: number } & { b: string }>, readonly ['a']>,
    Readonly<{ b: string }>
  >('=');

  // Intersection input: nested
  expectType<
    DeepOmit<
      Readonly<{ a: Readonly<{ b: number; c: string }> } & { d: boolean }>,
      readonly ['a', 'b']
    >,
    Readonly<{ a: Readonly<{ c: string }>; d: boolean }>
  >('=');

  // Intersection input: overlapping keys
  expectType<
    DeepOmit<
      Readonly<
        { a: Readonly<{ b: number; c: string }> } & {
          a: Readonly<{ b: 1; d: boolean }>;
        }
      >,
      readonly ['a', 'b']
    >,
    Readonly<{ a: Readonly<{ c: string; d: boolean }> }>
  >('=');

  // Intersection input with union paths
  expectType<
    DeepOmit<
      Readonly<{ a: Readonly<{ b: number; c: string }> } & { d: boolean }>,
      readonly ['a', 'b'] | readonly ['d']
    >,
    Readonly<{ a: Readonly<{ c: string }> }>
  >('=');
}

/*
 * Regression guard for `RecursableValue`, the "recurse or treat as a leaf"
 * branch guard (see the note on it in `deep-pick-omit.mts`).
 *
 * Tightening its `ReadonlyRecord<string, any>` to `UnknownRecord` stops the
 * recursion one level early for every type without an implicit index
 * signature: `DeepPick` collapses the value to `{}` and `DeepOmit` becomes a
 * no-op. Each assertion below fails if that happens.
 */
{
  // Class instance types are the fixture on purpose — they are the shape that
  // gets no implicit index signature and survives this repo's autofixes. Do
  // not "simplify" them into object type aliases: those do get one, and the
  // assertions would then pass under either spelling. (`interface` works too
  // in principle, but `consistent-type-definitions` rewrites it into an alias.)
  class Leaf {
    readonly x: number = 0;
    readonly y: string = '';
  }

  class Root {
    readonly a: Leaf = new Leaf();
  }

  // Fixture integrity: were these to gain an index signature, every assertion
  // below would stop testing anything.
  expectType<Leaf extends UnknownRecord ? true : false, false>('=');

  expectType<Root extends UnknownRecord ? true : false, false>('=');

  // Such a value is recursed into, not collapsed to `{}` / left untouched.
  expectType<
    DeepPick<Readonly<{ a: Leaf }>, readonly ['a', 'x']>,
    Readonly<{ a: Readonly<{ x: number }> }>
  >('=');

  expectType<
    DeepOmit<Readonly<{ a: Leaf }>, readonly ['a', 'x']>,
    Readonly<{ a: Readonly<{ y: string }> }>
  >('=');

  // The same holds when it is reached from a root of the same shape.
  expectType<
    DeepPick<Root, readonly ['a', 'x']>,
    Readonly<{ a: Readonly<{ x: number }> }>
  >('=');

  expectType<
    DeepOmit<Root, readonly ['a', 'x']>,
    Readonly<{ a: Readonly<{ y: string }> }>
  >('=');
}
