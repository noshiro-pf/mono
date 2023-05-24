import { type TypeEq } from './utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyBrand = Brand<any, any, any>;

export type Brand<
  T,
  TrueKeys extends string,
  FalseKeys extends string = never
> = T & {
  readonly [key in FalseKeys | TrueKeys]: key extends TrueKeys ? true : false;
};

export type UnwrapBrandKey<B extends AnyBrand> = keyof B;

/** @internal */
type _ExtractTrueKeys<B, K extends keyof B> = K extends K
  ? TypeEq<B[K], true> extends true
    ? K
    : never
  : never;

export type UnwrapBrandTrueKey<B extends AnyBrand> = _ExtractTrueKeys<
  B,
  keyof B
>;

/** @internal */
type _ExtractFalseKeys<B extends AnyBrand, K extends keyof B> = K extends K
  ? TypeEq<B[K], false> extends true
    ? K
    : never
  : never;

export type UnwrapBrandFalseKey<B extends AnyBrand> = _ExtractFalseKeys<
  B,
  keyof B
>;

/** @internal */
type _ExtractBooleanKeys<B extends AnyBrand, K extends keyof B> = K extends K
  ? TypeEq<B[K], boolean> extends true
    ? K
    : never
  : never;

export type UnwrapBrandBooleanKey<B extends AnyBrand> = _ExtractBooleanKeys<
  B,
  keyof B
>;

export type GetBrandKeysPart<B extends AnyBrand> = Pick<B, UnwrapBrandKey<B>>;

export type GetBrandValuePart<B extends AnyBrand> = B extends Brand<
  infer T,
  UnwrapBrandTrueKey<B> & string,
  UnwrapBrandFalseKey<B> & string
>
  ? T
  : never;

export type ExtendBrand<
  B extends AnyBrand,
  T extends string,
  F extends string = never
> = Brand<
  GetBrandValuePart<B>,
  T | (UnwrapBrandTrueKey<B> & string),
  F | (UnwrapBrandFalseKey<B> & string)
>;

export type IntersectBrand<B1 extends AnyBrand, B2 extends AnyBrand> = Brand<
  GetBrandValuePart<B1> & GetBrandValuePart<B2>,
  string & (UnwrapBrandTrueKey<B1> | UnwrapBrandTrueKey<B2>),
  string & (UnwrapBrandFalseKey<B1> | UnwrapBrandFalseKey<B2>)
>;

/**
 * ある key が true | false になる場合、その key を削除する
 */
export type NormalizeBrandUnion<B extends AnyBrand> = GetBrandValuePart<B> & {
  readonly [key in Exclude<
    UnwrapBrandKey<B>,
    UnwrapBrandBooleanKey<B>
  >]: B[key];
};
