import { IList } from '../../immutable';

export const average = (array: readonly number[]): number =>
  IList.isEmpty(array) ? 0 : IList.sum(array) / array.length;
