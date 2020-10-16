import { map } from './map';

export class Mappable<A> {
  data: A[] = [];

  constructor(data: A[]) {
    this.data = data.slice();
  }

  map<B>(mapFn: (v: A) => B): Mappable<B> {
    return map(this, mapFn);
  }
}
