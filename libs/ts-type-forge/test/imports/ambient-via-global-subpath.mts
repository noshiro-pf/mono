// Verifies that pulling in `ts-type-forge/global` opts the caller in to
// ambient access for every named ts-type-forge type. After loading
// `global.mts`, types like `Brand` / `JsonValue` / `Seq` are available
// without explicit imports.
//
// External consumers do this with
// `/// <reference types="ts-type-forge/global" />`, which resolves
// through the package's `exports['./global']` entry. This test uses a
// path-based reference so it can run without a self-symlink in
// node_modules.

/// <reference path="../../src/global.mts" />

import { expectType } from 'ts-data-forge';

type Email = Brand<string, 'Email'>;

type Dice = UintRangeInclusive<1, 6>;

expectType<Dice, 1 | 2 | 3 | 4 | 5 | 6>('=');
expectType<TypeEq<string, string>, true>('=');

// `JsonValue`, `Mutable`, `Seq`, `Increment` are all reachable without
// any `import` statement once the triple-slash directive above is in
// place — that is the entire point of the `/global` subpath.
declare const e: Email;

declare const j: JsonValue;

declare const m: Mutable<Readonly<{ x: 1 }>>;

declare const seq: Seq<3>;

declare const inc: Increment<3>;

declare const p: Primitive;

declare const r: UnknownRecord;

const _ = (
  _0: typeof e,
  _1: typeof j,
  _2: typeof m,
  _3: typeof seq,
  _4: typeof inc,
  _5: typeof p,
  _6: typeof r,
): void => undefined;

_(e, j, m, seq, inc, p, r);
