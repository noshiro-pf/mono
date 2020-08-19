import { filter } from './filter';

export const filterNot = <A>(
  set: Set<A>,
  filterFn: (a: A) => boolean
): Set<A> => filter(set, (a) => !filterFn(a));
