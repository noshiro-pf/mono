import { type TypeEq } from './utils';

export type Brand<
  T,
  TrueKeys extends string,
  FalseKeys extends string = never
> = T & {
  readonly [key in FalseKeys | TrueKeys]: key extends TrueKeys ? true : false;
};

export type UnwrapBrandKey<B> = keyof B;

/** @internal */
type _ExtractTrueKeys<B, K extends keyof B> = K extends K
  ? TypeEq<B[K], true> extends true
    ? K
    : never
  : never;

export type UnwrapBrandTrueKey<B> = _ExtractTrueKeys<B, keyof B>;

/** @internal */
type _ExtractFalseKeys<B, K extends keyof B> = K extends K
  ? TypeEq<B[K], false> extends true
    ? K
    : never
  : never;

export type UnwrapBrandFalseKey<B> = _ExtractFalseKeys<B, keyof B>;

/** @internal */
type _ExtractBooleanKeys<B, K extends keyof B> = K extends K
  ? TypeEq<B[K], boolean> extends true
    ? K
    : never
  : never;

export type UnwrapBrandBooleanKey<B> = _ExtractBooleanKeys<B, keyof B>;

export type GetBrandKeysPart<B> = Pick<B, UnwrapBrandKey<B>>;

export type GetBrandValuePart<B> = B extends Brand<
  infer T,
  UnwrapBrandTrueKey<B> & string,
  UnwrapBrandFalseKey<B> & string
>
  ? T
  : never;

export type ExtendBrand<B, T extends string, F extends string = never> = Brand<
  GetBrandValuePart<B>,
  T | (UnwrapBrandTrueKey<B> & string),
  F | (UnwrapBrandFalseKey<B> & string)
>;

export type IntersectBrand<B1, B2> = Brand<
  GetBrandValuePart<B1> & GetBrandValuePart<B2>,
  string & (UnwrapBrandTrueKey<B1> | UnwrapBrandTrueKey<B2>),
  string & (UnwrapBrandFalseKey<B1> | UnwrapBrandFalseKey<B2>)
>;

/**
 * ある key が true | false になる場合、その key を削除する
 */
export type NormalizeBrandUnion<B> = GetBrandValuePart<B> & {
  readonly [key in Exclude<
    UnwrapBrandKey<B>,
    UnwrapBrandBooleanKey<B>
  >]: B[key];
};
