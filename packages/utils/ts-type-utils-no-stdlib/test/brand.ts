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
} from '../src';
import { expectType } from './expect-type';

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
  expectType<Readonly<{ T: true; B: boolean; F: false }> & number, AB>('<=');
  expectType<Readonly<{ T: true; B: boolean; F: false }> & number, AB>('!=');

  expectType<GetBrandValuePart<A>, number>('=');

  expectType<
    IntersectBrand<A, B>,
    Readonly<{
      B: true;
      T: true;
      F: false;
    }> &
      number
  >('=');

  expectType<UnwrapBrandKeys<A>, 'B' | 'F' | 'T'>('=');
  expectType<UnwrapBrandKeys<B>, 'B' | 'F' | 'T'>('=');
  expectType<UnwrapBrandTrueKeys<AB>, 'T'>('=');
  expectType<UnwrapBrandFalseKeys<AB>, 'F'>('=');
  expectType<UnwrapBrandBooleanKeys<AB>, 'B'>('=');

  expectType<GetBrandKeysPart<AB>, Readonly<{ B: boolean; T: true; F: false }>>(
    '=',
  );
  expectType<NormalizeBrandUnion<AB>, Readonly<{ T: true; F: false }> & number>(
    '=',
  );
}
