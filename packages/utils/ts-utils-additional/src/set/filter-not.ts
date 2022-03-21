import { setFilter } from './filter';

export const setFilterNot = <A>(
  set: ReadonlySet<A>,
  filterFn: (a: A) => boolean
): Set<A> => setFilter(set, (a) => !filterFn(a));
