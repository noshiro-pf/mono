import { expectType } from 'ts-data-forge';
import {
  type OptionalKeys,
  type PartiallyNullable,
  type PartiallyOptional,
  type PartiallyPartial,
  type PartiallyRequired,
  type RequiredKeys,
  type TSTypeForgeInternals_MapToNever,
  type TSTypeForgeInternals_PickUndefined,
} from './partial.mjs';

// Base type for testing
type Base = Readonly<{
  a: number; // required
  b?: string; // optional
  c: boolean | undefined; // required, includes undefined
  d?: number | undefined; // optional, includes undefined
  e: null; // required
}>;

// --- PartiallyPartial / PartiallyOptional ---
{
  // Make 'a' (required) partial
  expectType<
    PartiallyPartial<Base, 'a'>,
    Readonly<{
      a?: number;
      b?: string;
      c: boolean | undefined;
      d?: number | undefined;
      e: null;
    }>
  >('=');

  expectType<
    PartiallyOptional<Base, 'a'>,
    Readonly<{
      a?: number;
      b?: string;
      c: boolean | undefined;
      d?: number | undefined;
      e: null;
    }>
  >('=');

  // Make 'b' (optional) partial -> stays optional
  expectType<
    PartiallyPartial<Base, 'b'>,
    Readonly<{
      a: number;
      b?: string;
      c: boolean | undefined;
      d?: number | undefined;
      e: null;
    }>
  >('=');

  // Make 'c' (required, includes undefined) partial
  expectType<
    PartiallyPartial<Base, 'c'>,
    Readonly<{
      a: number;
      b?: string;
      c?: boolean | undefined;
      d?: number | undefined;
      e: null;
    }>
  >('=');

  // Make 'd' (optional, includes undefined) partial -> stays optional
  expectType<
    PartiallyPartial<Base, 'd'>,
    Readonly<{
      a: number;
      b?: string;
      c: boolean | undefined;
      d?: number | undefined;
      e: null;
    }>
  >('=');

  // Make multiple keys partial
  expectType<
    PartiallyPartial<Base, 'a' | 'c' | 'e'>,
    Readonly<{
      a?: number;
      b?: string;
      c?: boolean | undefined;
      d?: number | undefined;
      e?: null;
    }>
  >('=');
}

// --- PartiallyNullable ---
{
  // Make 'a' (required) nullable
  expectType<
    PartiallyNullable<Base, 'a'>,
    Readonly<{
      a: number | undefined;
      b?: string;
      c: boolean | undefined;
      d?: number | undefined;
      e: null;
    }>
  >('=');

  // Make 'b' (optional) nullable -> becomes string | undefined
  expectType<
    PartiallyNullable<Base, 'b'>,
    Readonly<{
      a: number;
      b?: string | undefined;
      c: boolean | undefined;
      d?: number | undefined;
      e: null;
    }>
  >('=');

  // Make 'c' (required, includes undefined) nullable -> stays boolean | undefined
  expectType<
    PartiallyNullable<Base, 'c'>,
    Readonly<{
      a: number;
      b?: string;
      c: boolean | undefined;
      d?: number | undefined;
      e: null;
    }>
  >('=');

  // Make 'd' (optional, includes undefined) nullable -> stays number | undefined
  expectType<
    PartiallyNullable<Base, 'd'>,
    Readonly<{
      a: number;
      b?: string;
      c: boolean | undefined;
      d?: number | undefined;
      e: null;
    }>
  >('=');

  // Make 'e' (required null) nullable -> becomes null | undefined
  expectType<
    PartiallyNullable<Base, 'e'>,
    Readonly<{
      a: number;
      b?: string;
      c: boolean | undefined;
      d?: number | undefined;
      e: null | undefined;
    }>
  >('=');

  // Make multiple keys nullable
  expectType<
    PartiallyNullable<Base, 'a' | 'b' | 'e'>,
    Readonly<{
      a: number | undefined;
      b?: string | undefined;
      c: boolean | undefined;
      d?: number | undefined;
      e: null | undefined;
    }>
  >('=');
}

// --- PartiallyRequired ---
{
  // Make 'a' (required) required -> stays required
  expectType<
    PartiallyRequired<Base, 'a'>,
    Readonly<{
      a: number;
      b?: string;
      c: boolean | undefined;
      d?: number | undefined;
      e: null;
    }>
  >('=');

  // Make 'b' (optional) required -> becomes required string
  expectType<
    PartiallyRequired<Base, 'b'>,
    Readonly<{
      a: number;
      b: string; // No longer optional
      c: boolean | undefined;
      d?: number | undefined;
      e: null;
    }>
  >('=');

  // Make 'c' (required, includes undefined) required -> removes undefined
  expectType<
    PartiallyRequired<Base, 'c'>,
    Readonly<{
      a: number;
      b?: string;
      c: boolean | undefined; // undefined removed
      d?: number | undefined;
      e: null;
    }>
  >('=');

  // Make 'd' (optional, includes undefined) required -> becomes required number
  expectType<
    PartiallyRequired<Base, 'd'>,
    Readonly<{
      a: number;
      b?: string;
      c: boolean | undefined;
      d: number; // No longer optional, undefined removed
      e: null;
    }>
  >('=');

  // Make multiple keys required
  expectType<
    PartiallyRequired<Base, 'b' | 'c' | 'd'>,
    Readonly<{
      a: number;
      b: string;
      c: boolean | undefined;
      d: number;
      e: null;
    }>
  >('=');
}

// --- PickUndefined ---
{
  type R = Readonly<{
    a?: 0; // yes (optional implies undefined)
    b?: 0 | undefined; // yes (optional implies undefined)
    c?: undefined; // yes (optional implies undefined)
    d: 0; // no
    e: undefined; // yes
    f: 0 | undefined; // yes
    g: null; // no
    h: null | undefined; // yes
  }>;

  expectType<
    TSTypeForgeInternals_PickUndefined<R>,
    'a' | 'b' | 'c' | 'e' | 'f' | 'h'
  >('=');
}

// --- MapToNever ---
{
  expectType<
    TSTypeForgeInternals_MapToNever<Readonly<{ a: 1; b: 'x' }>>,
    Readonly<{ a: never; b: never }>
  >('=');

  expectType<TSTypeForgeInternals_MapToNever<{}>, {}>('=');
}

// --- OptionalKeys ---
{
  type R = Readonly<{
    a?: 0; // yes
    b?: 0 | undefined; // yes
    c?: undefined; // yes
    d: 0; // no
    e: undefined; // no
    f: 0 | undefined; // no
    g: null; // no
    h: null | undefined; // no
  }>;

  // OptionalKeys checks for the '?' modifier specifically
  expectType<OptionalKeys<R>, 'a' | 'b' | 'c'>('=');
}

// --- RequiredKeys ---
{
  type R = Readonly<{
    a?: 0; // no
    b?: 0 | undefined; // no
    c?: undefined; // no
    d: 0; // yes
    e: undefined; // yes
    f: 0 | undefined; // yes
    g: null; // yes
    h: null | undefined; // yes
  }>;

  // RequiredKeys is the inverse of OptionalKeys
  expectType<RequiredKeys<R>, 'd' | 'e' | 'f' | 'g' | 'h'>('=');
}
