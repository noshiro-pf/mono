import {
  type Brand,
  type ExtendBrand,
  type GetBrandKeysPart,
  type GetBrandValuePart,
  type IntersectBrand,
  type NormalizeBrandUnion,
  type UnwrapBrandBooleanKey,
  type UnwrapBrandFalseKey,
  type UnwrapBrandKey,
  type UnwrapBrandTrueKey,
} from '../src';
import { expectType } from './expect-type';

type A = Brand<number, 'A'>;

expectType<UnwrapBrandTrueKey<A>, 'A'>('=');
expectType<GetBrandValuePart<A>, number>('=');

type AB = Brand<number, 'A' | 'B'>;

expectType<ExtendBrand<A, 'B'>, AB>('=');

{
  type A = Brand<number, 'B' | 'T', 'F'>;
  type B = Brand<number, 'T', 'B' | 'F'>;
  type AB = A | B;

  // なぜか '=' にならない…
  expectType<AB, Readonly<{ T: true; B: boolean; F: false }> & number>('<=');
  expectType<Readonly<{ T: true; B: boolean; F: false }> & number, AB>('<=');

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

  expectType<UnwrapBrandKey<A>, 'B' | 'F' | 'T'>('=');
  expectType<UnwrapBrandKey<B>, 'B' | 'F' | 'T'>('=');
  expectType<UnwrapBrandTrueKey<AB>, 'T'>('=');
  expectType<UnwrapBrandFalseKey<AB>, 'F'>('=');
  expectType<UnwrapBrandBooleanKey<AB>, 'B'>('=');

  expectType<GetBrandKeysPart<AB>, Readonly<{ B: boolean; T: true; F: false }>>(
    '='
  );
  expectType<NormalizeBrandUnion<AB>, Readonly<{ T: true; F: false }> & number>(
    '='
  );
}
