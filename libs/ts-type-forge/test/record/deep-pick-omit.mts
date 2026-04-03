import { expectType } from '../expect-type.mjs';

// --- DeepPick ---
{
  // Basic nested pick
  expectType<
    DeepPick<{ a: { b: { c: number; d: number } } }, ['a', 'b', 'c']>,
    { a: { b: { c: number } } }
  >('=');

  // Pick at depth 1
  expectType<DeepPick<{ a: number; b: string }, ['a']>, { a: number }>('=');

  // Pick at depth 1
  expectType<
    DeepPick<{ a: { b: number; c: string } }, ['a']>,
    { a: { b: number; c: string } }
  >('=');

  // Pick at depth 2
  expectType<
    DeepPick<{ a: { b: number; c: string }; d: boolean }, ['a', 'b']>,
    { a: { b: number } }
  >('=');

  // Pick preserves the full path structure
  expectType<
    DeepPick<
      { a: { b: { c: number; d: string }; e: boolean }; f: number },
      ['a', 'b', 'd']
    >,
    { a: { b: { d: string } } }
  >('=');

  // Multiple picks via union of paths
  expectType<
    DeepPick<
      { a: { b: number; c: string; d: boolean }; e: boolean },
      ['a', 'b'] | ['a', 'c']
    >,
    { a: { b: number; c: string } }
  >('=');

  // Multiple picks at different depths
  expectType<
    DeepPick<{ a: { b: { c: number } }; d: string }, ['a', 'b', 'c'] | ['d']>,
    { a: { b: { c: number } }; d: string }
  >('=');

  // Single key path (depth 1)
  expectType<
    DeepPick<{ x: number; y: string; z: boolean }, ['x']>,
    { x: number }
  >('=');

  // Optional properties
  expectType<
    DeepPick<{ a?: { b: number; c: string } }, ['a', 'b']>,
    { a?: { b: number } }
  >('=');

  // Readonly properties
  expectType<
    DeepPick<Readonly<{ a: Readonly<{ b: number; c: string }> }>, ['a', 'b']>,
    Readonly<{ a: Readonly<{ b: number }> }>
  >('=');

  // Prefix path: shorter path picks entire subtree
  expectType<
    DeepPick<{ a: { b: number; c: string } }, ['a'] | ['a', 'b']>,
    { a: { b: number; c: string } }
  >('=');

  // Prefix path at deeper level
  expectType<
    DeepPick<
      { a: { b: { c: number; d: string }; e: boolean } },
      ['a', 'b'] | ['a', 'b', 'c']
    >,
    { a: { b: { c: number; d: string } } }
  >('=');

  // Prefix path: short path skipping 2 levels
  expectType<
    DeepPick<{ a: { b: { c: number; d: string } } }, ['a'] | ['a', 'b', 'c']>,
    { a: { b: { c: number; d: string } } }
  >('=');

  // Prefix path with multiple longer paths
  expectType<
    DeepPick<
      { a: { b: number; c: string; d: boolean } },
      ['a'] | ['a', 'b'] | ['a', 'c']
    >,
    { a: { b: number; c: string; d: boolean } }
  >('=');

  // Prefix path on different keys simultaneously
  expectType<
    DeepPick<
      { a: { b: number; c: string }; d: { e: number; f: string } },
      ['a'] | ['d', 'e']
    >,
    { a: { b: number; c: string }; d: { e: number } }
  >('=');

  // Prefix path with optional property
  expectType<
    DeepPick<{ a?: { b: number; c: string } }, ['a'] | ['a', 'b']>,
    { a?: { b: number; c: string } }
  >('=');

  // Path through non-record: leaf pick returns the primitive value
  expectType<DeepPick<{ a: number }, ['a']>, { a: number }>('=');

  // Path through primitive: consistent with RelaxedPick (non-existent key → {})
  expectType<DeepPick<{ a: number }, ['a', 'b']>, { a: NonNullable<unknown> }>(
    '=',
  );

  // Path through primitive with method name: still {} (primitives are opaque)
  expectType<
    DeepPick<{ a: number }, ['a', 'toString']>,
    { a: NonNullable<unknown> }
  >('=');

  // Non-existent nested key on record: consistent with RelaxedPick
  expectType<
    DeepPick<{ a: { b: number } }, ['a', 'x']>,
    { a: NonNullable<unknown> }
  >('=');

  // Non-existent top-level key: consistent with RelaxedPick
  expectType<DeepPick<{ a: number }, ['x']>, NonNullable<unknown>>('=');

  // Union input: distributes over each member
  expectType<
    DeepPick<{ a: number; b: string } | { a: boolean; c: number }, ['a']>,
    { a: number } | { a: boolean }
  >('=');

  // Union input: nested
  expectType<
    DeepPick<
      { a: { b: number; c: string } } | { a: { b: boolean; d: number } },
      ['a', 'b']
    >,
    { a: { b: number } } | { a: { b: boolean } }
  >('=');

  // Union input: members with disjoint keys
  expectType<
    DeepPick<{ a: number } | { b: string }, ['a']>,
    { a: number } | NonNullable<unknown>
  >('=');

  // Reference: picking a non-existent key produces an empty object type
  expectType<RelaxedPick<{ b: number }, 'a'>, {}>('=');

  // Union input with union paths
  expectType<
    DeepPick<
      | { a: { b: number; c: string } }
      | { a: { b: boolean; d: number }; e: string },
      ['a', 'b'] | ['e']
    >,
    { a: { b: number } } | { a: { b: boolean }; e: string }
  >('=');

  // Intersection input: pick from flattened shape
  expectType<DeepPick<{ a: number } & { b: string }, ['a']>, { a: number }>(
    '=',
  );

  // Intersection input: nested
  expectType<
    DeepPick<{ a: { b: number; c: string } } & { d: boolean }, ['a', 'b']>,
    { a: { b: number } }
  >('=');

  // Intersection input: overlapping keys narrow the value
  expectType<
    DeepPick<
      { a: { b: number; c: string } } & { a: { b: 1; d: boolean } },
      ['a', 'b']
    >,
    { a: { b: 1 } }
  >('=');

  // Intersection input with union paths
  expectType<
    DeepPick<
      { a: { b: number; c: string } } & { d: boolean },
      ['a', 'b'] | ['d']
    >,
    { a: { b: number }; d: boolean }
  >('=');
}

// --- DeepOmit ---
{
  // Basic nested omit
  expectType<
    DeepOmit<{ a: { b: { c: number; d: number } } }, ['a', 'b', 'c']>,
    { a: { b: { d: number } } }
  >('=');

  // Omit at depth 1
  expectType<DeepOmit<{ a: number; b: string }, ['a']>, { b: string }>('=');

  // Omit at depth 2
  expectType<
    DeepOmit<{ a: { b: number; c: string }; d: boolean }, ['a', 'b']>,
    { a: { c: string }; d: boolean }
  >('=');

  // Omit preserves the full structure except the target
  expectType<
    DeepOmit<
      { a: { b: { c: number; d: string }; e: boolean }; f: number },
      ['a', 'b', 'c']
    >,
    { a: { b: { d: string }; e: boolean }; f: number }
  >('=');

  // Multiple omits via union of paths
  expectType<
    DeepOmit<
      { a: { b: number; c: string; d: boolean } },
      ['a', 'b'] | ['a', 'c']
    >,
    { a: { d: boolean } }
  >('=');

  // Multiple omits at different depths
  expectType<
    DeepOmit<
      { a: { b: { c: number }; d: string }; e: boolean },
      ['a', 'b', 'c'] | ['e']
    >,
    { a: { b: NonNullable<unknown>; d: string } }
  >('=');

  // Single key path (depth 1)
  expectType<
    DeepOmit<{ x: number; y: string; z: boolean }, ['x']>,
    { y: string; z: boolean }
  >('=');

  // Optional properties
  expectType<
    DeepOmit<{ a?: { b: number; c: string } }, ['a', 'b']>,
    { a?: { c: string } }
  >('=');

  // Readonly properties
  expectType<
    DeepOmit<Readonly<{ a: Readonly<{ b: number; c: string }> }>, ['a', 'b']>,
    Readonly<{ a: Readonly<{ c: string }> }>
  >('=');

  // Prefix path: shorter path removes entire subtree
  expectType<
    DeepOmit<{ a: { b: number; c: string }; d: boolean }, ['a'] | ['a', 'b']>,
    { d: boolean }
  >('=');

  // Prefix path at deeper level
  expectType<
    DeepOmit<
      { a: { b: { c: number; d: string }; e: boolean } },
      ['a', 'b'] | ['a', 'b', 'c']
    >,
    { a: { e: boolean } }
  >('=');

  // Prefix path: short path skipping 2 levels
  expectType<
    DeepOmit<
      { a: { b: { c: number; d: string } }; e: boolean },
      ['a'] | ['a', 'b', 'c']
    >,
    { e: boolean }
  >('=');

  // Prefix path with multiple longer paths
  expectType<
    DeepOmit<
      { a: { b: number; c: string; d: boolean }; e: number },
      ['a'] | ['a', 'b'] | ['a', 'c']
    >,
    { e: number }
  >('=');

  // Prefix path on different keys simultaneously
  expectType<
    DeepOmit<
      { a: { b: number; c: string }; d: { e: number; f: string } },
      ['a'] | ['d', 'e']
    >,
    { d: { f: string } }
  >('=');

  // Prefix path with optional property
  expectType<
    DeepOmit<{ a?: { b: number; c: string }; d: boolean }, ['a'] | ['a', 'b']>,
    { d: boolean }
  >('=');

  // Path through non-record: primitives are opaque, T unchanged
  expectType<
    DeepOmit<{ a: number; b: string }, ['a', 'toString']>,
    { a: number; b: string }
  >('=');

  // Path through primitive with non-existent key: T unchanged
  expectType<
    DeepOmit<{ a: number; b: string }, ['a', 'x']>,
    { a: number; b: string }
  >('=');

  // Non-existent top-level key: T unchanged
  expectType<
    DeepOmit<{ a: number; b: string }, ['x']>,
    { a: number; b: string }
  >('=');

  // Non-existent nested key on record: T unchanged
  expectType<DeepOmit<{ a: { b: number } }, ['a', 'x']>, { a: { b: number } }>(
    '=',
  );

  // Union input: distributes over each member
  expectType<
    DeepOmit<{ a: number; b: string } | { a: boolean; c: number }, ['a']>,
    { b: string } | { c: number }
  >('=');

  // Union input: nested
  expectType<
    DeepOmit<
      { a: { b: number; c: string } } | { a: { b: boolean; d: number } },
      ['a', 'b']
    >,
    { a: { c: string } } | { a: { d: number } }
  >('=');

  // Union input: members with different nested shapes
  expectType<
    DeepOmit<
      { a: { x: number; y: string } } | { a: { x: boolean }; b: number },
      ['a', 'x']
    >,
    { a: { y: string } } | { a: NonNullable<unknown>; b: number }
  >('=');

  // Intersection input: omit from flattened shape
  expectType<DeepOmit<{ a: number } & { b: string }, ['a']>, { b: string }>(
    '=',
  );

  // Intersection input: nested
  expectType<
    DeepOmit<{ a: { b: number; c: string } } & { d: boolean }, ['a', 'b']>,
    { a: { c: string }; d: boolean }
  >('=');

  // Intersection input: overlapping keys
  expectType<
    DeepOmit<
      { a: { b: number; c: string } } & { a: { b: 1; d: boolean } },
      ['a', 'b']
    >,
    { a: { c: string; d: boolean } }
  >('=');

  // Intersection input with union paths
  expectType<
    DeepOmit<
      { a: { b: number; c: string } } & { d: boolean },
      ['a', 'b'] | ['d']
    >,
    { a: { c: string } }
  >('=');
}
