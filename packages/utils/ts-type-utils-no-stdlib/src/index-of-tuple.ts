import { type IsFixedLengthList } from './is-fixed-length-list';
import { type ToNumber } from './to-number';

export type IndexOfTuple<
  T extends readonly unknown[],
  K = keyof T
> = IsFixedLengthList<T> extends true
  ? K extends keyof T
    ? K extends `${number}`
      ? ToNumber<K>
      : never
    : never
  : number;
