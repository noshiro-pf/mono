import type { IsNever } from './is-never';
import type { StrictExclude } from './utils';

/** @internal */
type _IsUnionImpl<U, K extends U = U> = [U] extends [never]
  ? false
  : K extends unknown
  ? IsNever<StrictExclude<U, K>> extends true
    ? false
    : true
  : never;

export type IsUnion<U> = _IsUnionImpl<U>;
