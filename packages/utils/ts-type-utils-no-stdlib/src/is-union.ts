import { type BoolNot } from './boolean';
import { type IsNever } from './is-never';

export type IsUnion<U> = _IsUnionImpl<U, U>;

/** @internal */
type _IsUnionImpl<U, K extends U> = IsNever<U> extends true
  ? false
  : K extends K
  ? BoolNot<IsNever<Exclude<U, K>>>
  : never;
