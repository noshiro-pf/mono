import { expectType } from './expect-type.mjs';

{
  const _A_Brand: unique symbol = Symbol.for('A_Brand');

  type A = Brand<number, typeof _A_Brand>;

  expectType<UnwrapBrandTrueKeys<A>, typeof _A_Brand>('=');
  expectType<GetBrandValuePart<A>, number>('=');

  type AB = Brand<number, 'A' | 'B'>;

  expectType<ExtendBrand<A, 'B'>, AB>('=');
}
{
  type A = Brand<number, 'B' | 'T', 'F'>;
  type B = Brand<number, 'T', 'B' | 'F'>;
  type AB = A | B;

  // <= かつ >= だがなぜか '=' にならない…
  expectType<AB, Readonly<{ T: true; B: boolean; F: false }> & number>('<=');
  expectType<
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{ T: true; B: boolean; F: false }>
    > &
      number,
    AB
  >('<=');
  expectType<Readonly<{ T: true; B: boolean; F: false }> & number, AB>('!=');

  expectType<GetBrandValuePart<A>, number>('=');

  expectType<
    IntersectBrand<A, B>,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        B: true;
        T: true;
        F: false;
      }>
    > &
      number
  >('=');

  expectType<
    IntersectBrand<PositiveNumber, Uint32>,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        '!=0': true;
        '> -2^16': true;
        '> -2^32': true;
        '>= -2^15': true;
        '>= -2^31': true;
        '>=0': true;
        '< 2^32': true;
        Finite: true;
        Int: true;
        SafeInt: true;
      }>
    > &
      number
  >('=');

  expectType<
    IntersectBrand<PositiveInt, Uint32>,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        '!=0': true;
        '> -2^16': true;
        '> -2^32': true;
        '>= -2^15': true;
        '>= -2^31': true;
        '>=0': true;
        '< 2^32': true;
        Finite: true;
        Int: true;
        SafeInt: true;
      }>
    > &
      number
  >('=');

  expectType<
    PositiveInt & Uint32,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        '!=0': true;
        '> -2^16': true;
        '> -2^32': true;
        '>= -2^15': true;
        '>= -2^31': true;
        '>=0': true;
        '< 2^32': true;
        Finite: true;
        Int: true;
        SafeInt: true;
      }>
    > &
      number
  >('!=');

  expectType<UnwrapBrandKeys<A>, 'B' | 'F' | 'T'>('=');
  expectType<UnwrapBrandKeys<B>, 'B' | 'F' | 'T'>('=');
  expectType<UnwrapBrandTrueKeys<AB>, 'T'>('=');
  expectType<UnwrapBrandFalseKeys<AB>, 'F'>('=');
  expectType<UnwrapBrandBooleanKeys<AB>, 'B'>('=');

  expectType<GetBrandKeysPart<AB>, Readonly<{ B: boolean; T: true; F: false }>>(
    '=',
  );
  expectType<
    NormalizeBrandUnion<AB>,
    TSTypeUtilsInternals.BrandEncapsulated<Readonly<{ T: true; F: false }>> &
      number
  >('=');
}
