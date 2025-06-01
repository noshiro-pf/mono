type UnknownBrand = Brand<unknown, never, never>;

/** @internal Contains internal implementation details. */
declare namespace TSTypeUtilsInternals {
  // const brand_: unique symbol;

  /**
   * `ts-type-utils` 外で作られた branded type と競合しないように型を区別する。
   *
   * MEMO: [gcanti/io-ts](https://github.com/gcanti/io-ts) では unique symbol
   * を使っているが 型ライブラリとして独立できるようにするために ts-type-utils では使用していない。
   *
   * @internal
   */
  type BrandEncapsulated<B> = B &
    Readonly<{
      'TSTypeUtilsInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3': unknown;
    }>;

  type ExtractTrueKeys<B extends UnknownBrand> = ExtractBooleanKeysImpl<
    B,
    keyof B,
    true
  >;

  type ExtractFalseKeys<B extends UnknownBrand> = ExtractBooleanKeysImpl<
    B,
    keyof B,
    false
  >;

  type ExtractBooleanKeys<B extends UnknownBrand> = ExtractBooleanKeysImpl<
    B,
    keyof B,
    boolean
  >;

  type ExtractBooleanKeysImpl<
    B extends UnknownBrand,
    K extends keyof B,
    Target extends boolean,
  > = K extends K ? (TypeEq<B[K], Target> extends true ? K : never) : never;
}

type Brand<T, TrueKeys extends string, FalseKeys extends string = never> = T &
  TSTypeUtilsInternals.BrandEncapsulated<{
    readonly [key in FalseKeys | TrueKeys]: key extends TrueKeys ? true : false;
  }>;

type UnwrapBrandTrueKeys<B extends UnknownBrand> =
  TSTypeUtilsInternals.ExtractTrueKeys<B>;

type UnwrapBrandFalseKeys<B extends UnknownBrand> =
  TSTypeUtilsInternals.ExtractFalseKeys<B>;

type UnwrapBrandBooleanKeys<B extends UnknownBrand> =
  TSTypeUtilsInternals.ExtractBooleanKeys<B>;

type UnwrapBrandKeys<B extends UnknownBrand> =
  | UnwrapBrandBooleanKeys<B>
  | UnwrapBrandFalseKeys<B>
  | UnwrapBrandTrueKeys<B>;

type GetBrandKeysPart<B extends UnknownBrand> = Pick<B, UnwrapBrandKeys<B>>;

type GetBrandValuePart<B extends UnknownBrand> =
  B extends Brand<
    infer T,
    UnwrapBrandTrueKeys<B> & string,
    UnwrapBrandFalseKeys<B> & string
  >
    ? T
    : never;

type ExtendBrand<
  B extends UnknownBrand,
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

type ChangeBaseBrand<B extends UnknownBrand, T> = Brand<
  T,
  UnwrapBrandTrueKeys<B> & string,
  UnwrapBrandFalseKeys<B> & string
>;

type IntersectBrand<B1 extends UnknownBrand, B2 extends UnknownBrand> = Brand<
  GetBrandValuePart<B1> & GetBrandValuePart<B2>,
  string & (UnwrapBrandTrueKeys<B1> | UnwrapBrandTrueKeys<B2>),
  string & (UnwrapBrandFalseKeys<B1> | UnwrapBrandFalseKeys<B2>)
>;

/** ある key が true | false になる場合、その key を削除する */
type NormalizeBrandUnion<B extends UnknownBrand> = GetBrandValuePart<B> &
  TSTypeUtilsInternals.BrandEncapsulated<{
    readonly [key in Exclude<
      UnwrapBrandKeys<B>,
      UnwrapBrandBooleanKeys<B>
    >]: B[key];
  }>;
