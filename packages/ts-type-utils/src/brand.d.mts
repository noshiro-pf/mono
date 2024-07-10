type BrandBase = Brand<unknown, never, never>;

/** @internal */
declare namespace TSTypeUtilsInternals {
  type ExtractTrueKeys<B, K extends keyof B> = K extends K
    ? TypeEq<B[K], true> extends true
      ? K
      : never
    : never;

  type ExtractFalseKeys<B extends BrandBase, K extends keyof B> = K extends K
    ? TypeEq<B[K], false> extends true
      ? K
      : never
    : never;

  /** @internal */
  type ExtractBooleanKeys<B extends BrandBase, K extends keyof B> = K extends K
    ? TypeEq<B[K], boolean> extends true
      ? K
      : never
    : never;
}

type Brand<T, TrueKeys extends string, FalseKeys extends string = never> = T & {
  readonly [key in FalseKeys | TrueKeys]: key extends TrueKeys ? true : false;
};

type UnwrapBrandTrueKeys<B extends BrandBase> =
  TSTypeUtilsInternals.ExtractTrueKeys<B, keyof B>;

type UnwrapBrandFalseKeys<B extends BrandBase> =
  TSTypeUtilsInternals.ExtractFalseKeys<B, keyof B>;

type UnwrapBrandBooleanKeys<B extends BrandBase> =
  TSTypeUtilsInternals.ExtractBooleanKeys<B, keyof B>;

type UnwrapBrandKeys<B extends BrandBase> =
  | UnwrapBrandBooleanKeys<B>
  | UnwrapBrandFalseKeys<B>
  | UnwrapBrandTrueKeys<B>;

type GetBrandKeysPart<B extends BrandBase> = Pick<B, UnwrapBrandKeys<B>>;

type GetBrandValuePart<B extends BrandBase> =
  B extends Brand<
    infer T,
    UnwrapBrandTrueKeys<B> & string,
    UnwrapBrandFalseKeys<B> & string
  >
    ? T
    : never;

type ExtendBrand<
  B extends BrandBase,
  T extends string,
  F extends string = never,
> =
  IsNever<F & T> extends true // T and F shouldn't have intersection
    ? Brand<
        GetBrandValuePart<B>,
        T | (UnwrapBrandTrueKeys<B> & string),
        F | (UnwrapBrandFalseKeys<B> & string)
      >
    : never;

type ChangeBaseBrand<B extends BrandBase, T> = Brand<
  T,
  UnwrapBrandTrueKeys<B> & string,
  UnwrapBrandFalseKeys<B> & string
>;

type IntersectBrand<B1 extends BrandBase, B2 extends BrandBase> = Brand<
  GetBrandValuePart<B1> & GetBrandValuePart<B2>,
  string & (UnwrapBrandTrueKeys<B1> | UnwrapBrandTrueKeys<B2>),
  string & (UnwrapBrandFalseKeys<B1> | UnwrapBrandFalseKeys<B2>)
>;

/** ある key が true | false になる場合、その key を削除する */
type NormalizeBrandUnion<B extends BrandBase> = GetBrandValuePart<B> & {
  readonly [key in Exclude<
    UnwrapBrandKeys<B>,
    UnwrapBrandBooleanKeys<B>
  >]: B[key];
};
