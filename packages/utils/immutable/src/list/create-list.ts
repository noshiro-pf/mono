import type { Index, Size } from '../types/size';
import type { IList } from './list-type';

export const createList = <T>(values: readonly T[]): IList<T> =>
  new IListClass(values);

class IListClass<T> implements IList<T> {
  private readonly _size: Size;
  private readonly _values: T[];

  constructor(values: readonly T[]) {
    this._size = values.length;
    this._values = values.slice();
  }

  get size(): Size {
    return this._size;
  }

  get length(): Size {
    return this.size;
  }

  get(index: Index): T | undefined {
    return this._values[index];
  }
}
