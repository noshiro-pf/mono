import { expectType } from '../expect-type.mjs';

// Base type for testing
type Base = {
  a: number; // required
  b?: string; // optional
  c: boolean | undefined; // required, includes undefined
  d?: number | undefined; // optional, includes undefined
  e: null; // required
};

// --- PartiallyPartial / PartiallyOptional ---
{
  // Make 'a' (required) partial
  expectType<
    PartiallyPartial<Base, 'a'>,
    {
      a?: number;
      b?: string;
      c: boolean | undefined;
      d?: number | undefined;
      e: null;
    }
  >('=');

  expectType<
    PartiallyOptional<Base, 'a'>,
    {
      a?: number;
      b?: string;
      c: boolean | undefined;
      d?: number | undefined;
      e: null;
    }
  >('=');

  // Make 'b' (optional) partial -> stays optional
  expectType<
    PartiallyPartial<Base, 'b'>,
    {
      a: number;
      b?: string;
      c: boolean | undefined;
      d?: number | undefined;
      e: null;
    }
  >('=');

  // Make 'c' (required, includes undefined) partial
  expectType<
    PartiallyPartial<Base, 'c'>,
    {
      a: number;
      b?: string;
      c?: boolean | undefined;
      d?: number | undefined;
      e: null;
    }
  >('=');

  // Make 'd' (optional, includes undefined) partial -> stays optional
  expectType<
    PartiallyPartial<Base, 'd'>,
    {
      a: number;
      b?: string;
      c: boolean | undefined;
      d?: number | undefined;
      e: null;
    }
  >('=');

  // Make multiple keys partial
  expectType<
    PartiallyPartial<Base, 'a' | 'c' | 'e'>,
    {
      a?: number;
      b?: string;
      c?: boolean | undefined;
      d?: number | undefined;
      e?: null;
    }
  >('=');
}

// --- PartiallyNullable ---
{
  // Make 'a' (required) nullable
  expectType<
    PartiallyNullable<Base, 'a'>,
    {
      a: number | undefined;
      b?: string;
      c: boolean | undefined;
      d?: number | undefined;
      e: null;
    }
  >('=');

  // Make 'b' (optional) nullable -> becomes string | undefined
  expectType<
    PartiallyNullable<Base, 'b'>,
    {
      a: number;
      b?: string | undefined;
      c: boolean | undefined;
      d?: number | undefined;
      e: null;
    }
  >('=');

  // Make 'c' (required, includes undefined) nullable -> stays boolean | undefined
  expectType<
    PartiallyNullable<Base, 'c'>,
    {
      a: number;
      b?: string;
      c: boolean | undefined;
      d?: number | undefined;
      e: null;
    }
  >('=');

  // Make 'd' (optional, includes undefined) nullable -> stays number | undefined
  expectType<
    PartiallyNullable<Base, 'd'>,
    {
      a: number;
      b?: string;
      c: boolean | undefined;
      d?: number | undefined;
      e: null;
    }
  >('=');

  // Make 'e' (required null) nullable -> becomes null | undefined
  expectType<
    PartiallyNullable<Base, 'e'>,
    {
      a: number;
      b?: string;
      c: boolean | undefined;
      d?: number | undefined;
      e: null | undefined;
    }
  >('=');

  // Make multiple keys nullable
  expectType<
    PartiallyNullable<Base, 'a' | 'b' | 'e'>,
    {
      a: number | undefined;
      b?: string | undefined;
      c: boolean | undefined;
      d?: number | undefined;
      e: null | undefined;
    }
  >('=');
}

// --- PartiallyRequired ---
{
  // Make 'a' (required) required -> stays required
  expectType<
    PartiallyRequired<Base, 'a'>,
    {
      a: number;
      b?: string;
      c: boolean | undefined;
      d?: number | undefined;
      e: null;
    }
  >('=');

  // Make 'b' (optional) required -> becomes required string
  expectType<
    PartiallyRequired<Base, 'b'>,
    {
      a: number;
      b: string; // No longer optional
      c: boolean | undefined;
      d?: number | undefined;
      e: null;
    }
  >('=');

  // Make 'c' (required, includes undefined) required -> removes undefined
  expectType<
    PartiallyRequired<Base, 'c'>,
    {
      a: number;
      b?: string;
      c: boolean | undefined; // undefined removed
      d?: number | undefined;
      e: null;
    }
  >('=');

  // Make 'd' (optional, includes undefined) required -> becomes required number
  expectType<
    PartiallyRequired<Base, 'd'>,
    {
      a: number;
      b?: string;
      c: boolean | undefined;
      d: number; // No longer optional, undefined removed
      e: null;
    }
  >('=');

  // Make multiple keys required
  expectType<
    PartiallyRequired<Base, 'b' | 'c' | 'd'>,
    {
      a: number;
      b: string;
      c: boolean | undefined;
      d: number;
      e: null;
    }
  >('=');
}

// --- PickUndefined ---
{
  type R = {
    a?: 0; // yes (optional implies undefined)
    b?: 0 | undefined; // yes (optional implies undefined)
    c?: undefined; // yes (optional implies undefined)
    d: 0; // no
    e: undefined; // yes
    f: 0 | undefined; // yes
    g: null; // no
    h: null | undefined; // yes
  };

  expectType<PickUndefined<R>, 'a' | 'b' | 'c' | 'e' | 'f' | 'h'>('=');
}

// --- MapToNever ---
{
  expectType<MapToNever<{ a: 1; b: 'x' }>, { a: never; b: never }>('=');
  expectType<MapToNever<{}>, {}>('=');
}

// --- OptionalKeys ---
{
  type R = {
    a?: 0; // yes
    b?: 0 | undefined; // yes
    c?: undefined; // yes
    d: 0; // no
    e: undefined; // no
    f: 0 | undefined; // no
    g: null; // no
    h: null | undefined; // no
  };

  // OptionalKeys checks for the '?' modifier specifically
  expectType<OptionalKeys<R>, 'a' | 'b' | 'c'>('=');
}

// --- RequiredKeys ---
{
  type R = {
    a?: 0; // no
    b?: 0 | undefined; // no
    c?: undefined; // no
    d: 0; // yes
    e: undefined; // yes
    f: 0 | undefined; // yes
    g: null; // yes
    h: null | undefined; // yes
  };

  // RequiredKeys is the inverse of OptionalKeys
  expectType<RequiredKeys<R>, 'd' | 'e' | 'f' | 'g' | 'h'>('=');
}
