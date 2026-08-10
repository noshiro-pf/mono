import { Mappable } from './mappable';

export const map = <A, B>(m: Mappable<A>, mapFn: (v: A) => B): Mappable<B> =>
  new Mappable(m.data.map(mapFn));
