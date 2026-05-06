import { expectType } from 'ts-data-forge';
import { type TSTypeForgeInternals_BrandEncapsulated } from './_internals.mjs';
import {
  type Brand,
  type ExtendBrand,
  type GetBrandKeysPart,
  type GetBrandValuePart,
  type IntersectBrand,
  type NormalizeBrandUnion,
  type UnwrapBrandBooleanKeys,
  type UnwrapBrandFalseKeys,
  type UnwrapBrandKeys,
  type UnwrapBrandTrueKeys,
} from './brand.mjs';
import { type PositiveNumber } from './core.mjs';
import { type PositiveInt } from './int.mjs';
import { type Uint32 } from './uint32.mjs';

{
  type A = Brand<number, 'A'>;

  expectType<UnwrapBrandTrueKeys<A>, 'A'>('=');

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
    TSTypeForgeInternals_BrandEncapsulated<
      Readonly<{ T: true; B: boolean; F: false }>
    > &
      number,
    AB
  >('<=');

  expectType<Readonly<{ T: true; B: boolean; F: false }> & number, AB>('!=');

  expectType<GetBrandValuePart<A>, number>('=');

  expectType<
    IntersectBrand<A, B>,
    TSTypeForgeInternals_BrandEncapsulated<
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
    TSTypeForgeInternals_BrandEncapsulated<
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
    TSTypeForgeInternals_BrandEncapsulated<
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
    TSTypeForgeInternals_BrandEncapsulated<
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
    TSTypeForgeInternals_BrandEncapsulated<Readonly<{ T: true; F: false }>> &
      number
  >('=');
}
