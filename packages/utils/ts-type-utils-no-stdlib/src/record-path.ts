import { type IndexOfTuple } from './index-of-tuple';
import { type IsNotFixedLengthList } from './is-fixed-length-list';
import { type ToNumber } from './to-number';
import { type Tuple } from './tuple';
import { type RecordBase } from './utils';

export type PathsWithIndex<R> = Prefixes<LeafPathsWithIndex<R>>;
export type Paths<R> = Prefixes<LeafPaths<R>>;

export type Prefixes<L extends readonly unknown[]> = L extends readonly [
  infer Head,
  ...infer Rest,
]
  ? readonly [] | readonly [Head, ...Prefixes<Rest>]
  : readonly [];

/** @internal */
type AttachValueTypeAtPath<R, Path extends Paths<R>> = Path extends Path
  ? readonly [Path, RecordValueAtPath<R, Path>]
  : never;

export type KeyPathAndValueTypeAtPathTuple<R> = AttachValueTypeAtPath<
  R,
  Paths<R>
>;

export type LeafPaths<R> = R extends readonly unknown[]
  ? LeafPathsImplListCase<R, keyof R>
  : R extends RecordBase
  ? LeafPathsImplRecordCase<R, keyof R>
  : readonly [];

/** @internal */
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

/** @internal */
type LeafPathsImplRecordCase<
  R extends RecordBase,
  PathHead extends keyof R,
> = string extends PathHead
  ? readonly []
  : PathHead extends keyof R
  ? readonly [PathHead, ...LeafPaths<R[PathHead]>]
  : never;

export type LeafPathsWithIndex<R> = R extends readonly unknown[]
  ? _LeafPathsWithIndexImplListCase<R, keyof R>
  : R extends RecordBase
  ? LeafPathsWithIndexImplRecordCase<R, keyof R>
  : readonly [];

/** @internal */
type _LeafPathsWithIndexImplListCase<
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

/** @internal */
type LeafPathsWithIndexImplRecordCase<
  R extends RecordBase,
  PathHead extends keyof R,
> = PathHead extends keyof R
  ? readonly [PathHead, ...LeafPathsWithIndex<R[PathHead]>]
  : never;

export type RecordUpdated<
  R,
  Path extends Paths<R>,
  ValueAfter,
> = Path extends readonly []
  ? ValueAfter
  : R extends readonly unknown[]
  ? RecordUpdatedImplTupleCase<R, Path, ValueAfter>
  : R extends RecordBase
  ? RecordUpdatedImplRecordCase<R, Path, ValueAfter>
  : R;

/** @internal */
type RecordUpdatedImplRecordCase<
  R extends RecordBase,
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

/** @internal */
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

export type RecordValueAtPath<
  R,
  Path extends Paths<R>,
> = Path extends readonly [infer Head, ...infer Rest]
  ? Head extends keyof R
    ? Rest extends Paths<R[Head]>
      ? RecordValueAtPath<R[Head], Rest>
      : never
    : never
  : R;

export type RecordValueAtPathWithIndex<
  R,
  Path extends PathsWithIndex<R>,
> = RecordValueAtPathWithIndexImpl<R, Path, never>;

/** @internal */
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
