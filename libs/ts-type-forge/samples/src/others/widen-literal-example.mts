import { type WidenLiteral } from 'ts-type-forge';

// embed-sample-code-ignore-above

// Basic literal widening
type Str = WidenLiteral<'hello'>; // string
type Num = WidenLiteral<123>; // number
type Bool = WidenLiteral<true>; // boolean
type Big = WidenLiteral<100n>; // bigint
type Sym = WidenLiteral<typeof Symbol.iterator>; // symbol

// Non-primitives remain unchanged
type Obj = WidenLiteral<Readonly<{ a: number }>>; // { a: number } (unchanged)
type Arr = WidenLiteral<readonly [1, 2, 3]>; // [1, 2, 3] (unchanged)

// Union types are widened distributively
type Union = WidenLiteral<'a' | 1 | true>; // string | number | boolean

// Practical use case: API compatibility
type ApiConfig = Readonly<{
  method: string; // API expects string, not literal
  timeout: number; // API expects number, not literal
}>;

type LiteralConfig = Readonly<{
  method: 'GET' | 'POST';
  timeout: 5000;
}>;

type CompatibleConfig = Readonly<{
  [K in keyof LiteralConfig]: WidenLiteral<LiteralConfig[K]>;
}>; // { method: string; timeout: number }

// embed-sample-code-ignore-below
export type {
  ApiConfig,
  Arr,
  Big,
  Bool,
  CompatibleConfig,
  LiteralConfig,
  Num,
  Obj,
  Str,
  Sym,
  Union,
};
