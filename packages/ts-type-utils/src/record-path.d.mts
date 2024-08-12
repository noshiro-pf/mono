type PathsWithIndex<R> = Prefixes<LeafPathsWithIndex<R>>;
type Paths<R> = Prefixes<LeafPaths<R>>;

type Prefixes<L extends readonly unknown[]> = L extends readonly [
  infer Head,
  ...infer Rest,
]
  ? readonly [] | readonly [Head, ...Prefixes<Rest>]
  : readonly [];

/** @internal */
declare namespace TSTypeUtilsInternals {
  type AttachValueTypeAtPath<R, Path extends Paths<R>> = Path extends Path
    ? readonly [Path, RecordValueAtPath<R, Path>]
    : never;
}

type KeyPathAndValueTypeAtPathTuple<R> =
  TSTypeUtilsInternals.AttachValueTypeAtPath<R, Paths<R>>;

type LeafPaths<R> = R extends readonly unknown[]
  ? TSTypeUtilsInternals.LeafPathsImplListCase<R, keyof R>
  : R extends UnknownRecord
    ? TSTypeUtilsInternals.LeafPathsImplRecordCase<R, keyof R>
    : readonly [];

/** @internal */
declare namespace TSTypeUtilsInternals {
  type LeafPathsImplListCase<
    T extends readonly unknown[],
    PathHead extends keyof T,
  > = T extends readonly []
    ? readonly []
    : IsNotFixedLengthList<T> extends true
      ? readonly []
      : PathHead extends keyof T
        ? PathHead extends `${number}`
          ? readonly [ToNumber<PathHead>, ...LeafPaths<T[PathHead]>]
          : never
        : never;

  type LeafPathsImplRecordCase<
    R extends UnknownRecord,
    PathHead extends keyof R,
  > = string extends PathHead
    ? readonly []
    : PathHead extends keyof R
      ? readonly [PathHead, ...LeafPaths<R[PathHead]>]
      : never;
}

type LeafPathsWithIndex<R> = R extends readonly unknown[]
  ? TSTypeUtilsInternals.LeafPathsWithIndexImplListCase<R, keyof R>
  : R extends UnknownRecord
    ? TSTypeUtilsInternals.LeafPathsWithIndexImplRecordCase<R, keyof R>
    : readonly [];

/** @internal */
declare namespace TSTypeUtilsInternals {
  type LeafPathsWithIndexImplListCase<
    T extends readonly unknown[],
    PathHead extends keyof T,
  > = T extends readonly []
    ? readonly []
    : IsNotFixedLengthList<T> extends true
      ? readonly [number, ...LeafPathsWithIndex<T[number]>]
      : PathHead extends keyof T
        ? PathHead extends `${number}`
          ? readonly [ToNumber<PathHead>, ...LeafPathsWithIndex<T[PathHead]>]
          : never
        : never;

  type LeafPathsWithIndexImplRecordCase<
    R extends UnknownRecord,
    PathHead extends keyof R,
  > = PathHead extends keyof R
    ? readonly [PathHead, ...LeafPathsWithIndex<R[PathHead]>]
    : never;
}

type RecordUpdated<
  R,
  Path extends Paths<R>,
  ValueAfter,
> = Path extends readonly []
  ? ValueAfter
  : R extends readonly unknown[]
    ? TSTypeUtilsInternals.RecordUpdatedImplTupleCase<R, Path, ValueAfter>
    : R extends UnknownRecord
      ? TSTypeUtilsInternals.RecordUpdatedImplRecordCase<R, Path, ValueAfter>
      : R;

/** @internal */
declare namespace TSTypeUtilsInternals {
  type RecordUpdatedImplRecordCase<
    R extends UnknownRecord,
    Path extends Paths<R>,
    ValueAfter,
  > = Path extends readonly [infer Head, ...infer Rest]
    ? Head extends keyof R
      ? Rest extends Paths<R[Head]>
        ? {
            readonly [Key in keyof R]: Key extends Head
              ? RecordUpdated<R[Head], Rest, ValueAfter>
              : R[Key];
          }
        : never
      : never
    : never;

  type RecordUpdatedImplTupleCase<
    T extends readonly unknown[],
    Path extends Paths<T>,
    ValueAfter,
  > = Path extends readonly [infer Head, ...infer Rest]
    ? Head extends IndexOfTuple<T>
      ? Rest extends Paths<T[Head]>
        ? Tuple.SetAt<T, Head, RecordUpdated<T[Head], Rest, ValueAfter>>
        : never
      : never
    : never;
}

type RecordValueAtPath<R, Path extends Paths<R>> = Path extends readonly [
  infer Head,
  ...infer Rest,
]
  ? Head extends keyof R
    ? Rest extends Paths<R[Head]>
      ? RecordValueAtPath<R[Head], Rest>
      : never
    : never
  : R;

type RecordValueAtPathWithIndex<
  R,
  Path extends PathsWithIndex<R>,
> = TSTypeUtilsInternals.RecordValueAtPathWithIndexImpl<R, Path, never>;

/** @internal */
declare namespace TSTypeUtilsInternals {
  type RecordValueAtPathWithIndexImpl<
    R,
    Path extends PathsWithIndex<R>,
    LastPathElement,
  > = Path extends readonly [infer Head, ...infer Rest]
    ? Head extends keyof R
      ? Rest extends PathsWithIndex<R[Head]>
        ? RecordValueAtPathWithIndexImpl<R[Head], Rest, Head>
        : never
      : never
    : number extends LastPathElement
      ? R | undefined
      : string extends LastPathElement
        ? R | undefined
        : R;
}
