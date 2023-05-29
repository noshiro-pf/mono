import { type IsNever } from './is-never';

export type IsUnion<U> = _IsUnionImpl<U>;

/** @internal */
type _IsUnionImpl<U, K extends U = U> = [U] extends [never]
  ? false
  : K extends unknown
  ? IsNever<Exclude<U, K>> extends true
    ? false
    : true
  : never;
