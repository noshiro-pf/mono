import { RN } from '../mod';
import { Operator } from '../types/Operator';

export const map =
  <T, U>(fn: (value: T, index: number) => U): Operator<T, U> =>
  (src: RN<T>) =>
    new MapRN<T, U>(src, fn);

export const mapTo =
  <T, U>(value: U): Operator<T, U> =>
  (src: RN<T>) =>
    new MapRN<T, U>(src, () => value);

export const pluck =
  <T, K extends keyof T>(member: K): Operator<T, T[K]> =>
  (src: RN<T>) =>
    new MapRN<T, T[K]>(src, (value) => value[member]);

export const withTimestamp =
  <T>(): Operator<T, [T, number]> =>
  (src: RN<T>) =>
    new MapRN<T, [T, number]>(src, (value) => [value, Date.now()]);

class MapRN<T, U> extends RN<U> {
  private fn: (value: T, index: number) => U;

  constructor(src: RN<T>, fn: (value: T, index: number) => U) {
    super(fn(src.value, src.index), [src]);
    this.fn = fn;
  }

  protected fire() {
    const next = this.parents[0];
    this.fireWith(this.fn(next.value, next.index));
  }
}
