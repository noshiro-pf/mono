import { expectType } from '../expect-type.mjs';

// --- StrictExtract ---
{
  expectType<StrictExtract<1 | 2 | 3, 1 | 2>, 1 | 2>('=');

  expectType<Extract<2 | 3, 1 | 2>, 2>('=');
  expectType<RelaxedExtract<2 | 3, 1 | 2>, 2>('=');
  // @ts-expect-error 2 | 3 is not assignable to 1 | 2
  expectType<StrictExtract<2 | 3, 1 | 2>, 1 | 2>('=');

  expectType<StrictExtract<1 | 2 | 3, 1 | 2>, 1 | 2>('=');
  // @ts-expect-error 2 | 3 is not assignable to 1 | 2
  expectType<StrictExtract<2 | 3, 1 | 2>, never>('=');
  expectType<StrictExtract<string | number, string>, string>('=');

  // @ts-expect-error string is not assignable to 'a' | 'b'
  expectType<StrictExtract<'a' | 'b', string>, 'a' | 'b'>('=');
  expectType<StrictExtract<string, 'a' | 'b'>, never>('=');
}

// --- RelaxedExtract ---
{
  expectType<RelaxedExtract<1 | 2 | 3, 1 | 2>, 1 | 2>('=');
  expectType<RelaxedExtract<2 | 3, 1 | 2>, 2>('='); // Standard Extract behavior
  expectType<RelaxedExtract<string | number, string>, string>('=');
  expectType<RelaxedExtract<'a' | 'b', string>, 'a' | 'b'>('=');
  expectType<RelaxedExtract<string, 'a' | 'b'>, never>('='); // Standard Extract behavior
}

type Base = { a: number; b: string; c: boolean };

// --- StrictPick ---
{
  expectType<StrictPick<Base, 'a' | 'b'>, { a: number; b: string }>('=');
  // @ts-expect-error 'x' is not in keyof Base
  expectType<StrictPick<Base, 'a' | 'x'>, never>('=');
}

// --- RelaxedPick ---
{
  expectType<RelaxedPick<Base, 'a' | 'b'>, { a: number; b: string }>('=');
  expectType<RelaxedPick<Base, 'a' | 'x'>, { a: number }>('='); // Ignores 'x'
  expectType<RelaxedPick<Base, string>, Base>('='); // Picks all string keys ('a', 'b', 'c')
  expectType<RelaxedPick<Base, number>, {}>('='); // No numeric keys
}

// --- StrictExclude ---
{
  expectType<StrictExclude<1 | 2 | 3, 1 | 2>, 3>('=');
  // @ts-expect-error 2 | 3 is not assignable to 1 | 2
  expectType<StrictExclude<1 | 2, 2 | 3>, never>('=');
  expectType<StrictExclude<string | number, string>, number>('=');
  expectType<StrictExclude<string, 'a' | 'b'>, string>('=');
  // @ts-expect-error 'a' | 'b' is not assignable to string
  expectType<StrictExclude<'a' | 'b', string>, never>('=');
}

// --- RelaxedExclude ---
{
  expectType<RelaxedExclude<1 | 2 | 3, 1 | 2>, 3>('=');
  expectType<RelaxedExclude<1 | 2, 2 | 3>, 1>('='); // Standard Exclude behavior
  expectType<RelaxedExclude<string | number, string>, number>('=');
  expectType<RelaxedExclude<string, 'a' | 'b'>, string>('='); // Standard Exclude behavior
  expectType<RelaxedExclude<'a' | 'b', string>, never>('=');
}

// --- StrictOmit ---
{
  expectType<StrictOmit<Base, 'c'>, { a: number; b: string }>('=');
  // @ts-expect-error 'x' is not in keyof Base
  expectType<StrictOmit<Base, 'a' | 'x'>, never>('=');
}

// --- RelaxedOmit ---
{
  expectType<RelaxedOmit<Base, 'c'>, { a: number; b: string }>('=');
  expectType<RelaxedOmit<Base, 'a' | 'x'>, { b: string; c: boolean }>('='); // Ignores 'x'
  expectType<RelaxedOmit<Base, string>, {}>('='); // Omits all string keys ('a', 'b', 'c')
  expectType<RelaxedOmit<Base, number>, Base>('='); // No numeric keys to omit
}

// --- MutableRecord ---
{
  expectType<MutableRecord<string, number>, Record<string, number>>('=');
  expectType<MutableRecord<'a' | 'b', boolean>, { a: boolean; b: boolean }>(
    '=',
  );
}

// --- ReadonlyRecord ---
{
  expectType<ReadonlyRecord<string, number>, Readonly<Record<string, number>>>(
    '=',
  );
  expectType<
    ReadonlyRecord<'a' | 'b', boolean>,
    Readonly<{ a: boolean; b: boolean }>
  >('=');
}
