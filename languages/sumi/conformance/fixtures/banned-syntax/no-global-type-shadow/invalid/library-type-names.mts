// @sumi-expect banned-syntax/no-global-type-shadow
type Array = readonly number[];

// @sumi-expect banned-syntax/no-global-type-shadow
interface Promise<T> {
  readonly value: T;
}

// @sumi-expect banned-syntax/no-global-type-shadow
export const wrap = <Date,>(value: Date): Date => value;

export type { Array, Promise };
