import { type IsNever } from './is-never';
import { type TypeEq } from './utils';

export type BrandBase = Brand<unknown, never, never>;

export type Brand<
  T,
  TrueKeys extends string,
  FalseKeys extends string = never,
> = T & {
  readonly [key in FalseKeys | TrueKeys]: key extends TrueKeys ? true : false;
};

export type UnwrapBrandKeys<B extends BrandBase> = keyof B;

/** @internal */
type _ExtractTrueKeys<B, K extends keyof B> = K extends K
  ? TypeEq<B[K], true> extends true
    ? K
    : never
  : never;

export type UnwrapBrandTrueKeys<B extends BrandBase> = _ExtractTrueKeys<
  B,
  keyof B
>;

/** @internal */
type _ExtractFalseKeys<B extends BrandBase, K extends keyof B> = K extends K
  ? TypeEq<B[K], false> extends true
    ? K
    : never
  : never;

export type UnwrapBrandFalseKeys<B extends BrandBase> = _ExtractFalseKeys<
  B,
  keyof B
>;

/** @internal */
type _ExtractBooleanKeys<B extends BrandBase, K extends keyof B> = K extends K
  ? TypeEq<B[K], boolean> extends true
    ? K
    : never
  : never;

export type UnwrapBrandBooleanKeys<B extends BrandBase> = _ExtractBooleanKeys<
  B,
  keyof B
>;

export type GetBrandKeysPart<B extends BrandBase> = Pick<B, UnwrapBrandKeys<B>>;

export type GetBrandValuePart<B extends BrandBase> = B extends Brand<
  infer T,
  UnwrapBrandTrueKeys<B> & string,
  UnwrapBrandFalseKeys<B> & string
>
  ? T
  : never;

export type ExtendBrand<
  B extends BrandBase,
  T extends string,
  F extends string = never,
> = IsNever<F & T> extends true // T and F shouldn't have intersection
  ? Brand<
      GetBrandValuePart<B>,
      T | (UnwrapBrandTrueKeys<B> & string),
      F | (UnwrapBrandFalseKeys<B> & string)
    >
  : never;

export type ChangeBaseBrand<B extends BrandBase, T> = Brand<
  T,
  UnwrapBrandTrueKeys<B> & string,
  UnwrapBrandFalseKeys<B> & string
>;

export type IntersectBrand<B1 extends BrandBase, B2 extends BrandBase> = Brand<
  GetBrandValuePart<B1> & GetBrandValuePart<B2>,
  string & (UnwrapBrandTrueKeys<B1> | UnwrapBrandTrueKeys<B2>),
  string & (UnwrapBrandFalseKeys<B1> | UnwrapBrandFalseKeys<B2>)
>;

/**
 * ある key が true | false になる場合、その key を削除する
 */
export type NormalizeBrandUnion<B extends BrandBase> = GetBrandValuePart<B> & {
  readonly [key in Exclude<
    UnwrapBrandKeys<B>,
    UnwrapBrandBooleanKeys<B>
  >]: B[key];
};
