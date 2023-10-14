import { RN } from '../mod';
import { Operator } from '../types/Operator';

export const map =
  <T, U>(
    fn: (srcValue: T, srcIndex: number, index: number) => U,
    name: string = '',
  ): Operator<T, U> =>
  (src: RN<T>) =>
    new MapRN<T, U>(src, fn, name);

export const mapTo =
  <T, U>(value: U, name: string = ''): Operator<T, U> =>
  (src: RN<T>) =>
    new MapRN<T, U>(src, () => value, name);

export const valueIs =
  <T>(value: T, name: string = ''): Operator<T, boolean> =>
  (src: RN<T>) =>
    new MapRN<T, boolean>(src, (x) => x === value, name);

export const valueIsNot =
  <T>(value: T, name: string = ''): Operator<T, boolean> =>
  (src: RN<T>) =>
    new MapRN<T, boolean>(src, (x) => x !== value, name);

export const pluck =
  <T, K extends keyof T>(member: K, name: string = ''): Operator<T, T[K]> =>
  (src: RN<T>) =>
    new MapRN<T, T[K]>(src, (value) => value[member], name);

export const withTimestamp =
  <T>(name: string = ''): Operator<T, [T, number]> =>
  (src: RN<T>) =>
    new MapRN<T, [T, number]>(src, (value) => [value, Date.now()], name);

class MapRN<T, U> extends RN<U> {
  private readonly fn: (srcValue: T, srcIndex: number, index: number) => U;

  constructor(
    src: RN<T>,
    fn: (srcValue: T, srcIndex: number, index: number) => U,
    name: string,
  ) {
    super(fn(src.value, src.index, -1), [src], name);
    this.fn = fn;
  }

  protected fire(): void {
    const src = this.parents[0] as RN<any>;
    // note: 'this.index' is not updated yet (will be updated in this.fireWith())
    this.fireWith(this.fn(src.value, src.index, this.index + 1));
  }
}
