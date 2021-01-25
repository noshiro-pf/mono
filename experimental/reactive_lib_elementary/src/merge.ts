import { Observable } from './Observable';
import { ArrayElement, Unwrap } from './util-types';

export const merge = <T extends Observable<any>[]>(
  ...srcs: T
): Observable<ArrayElement<Unwrap<T>>> => new MergeObservable(...srcs);

class MergeObservable<T extends Observable<any>[]> extends Observable<
  ArrayElement<Unwrap<T>>
> {
  constructor(...srcs: T) {
    super();

    srcs.forEach((src) => {
      src.subscribe((v) => this.update(v));
    });
  }
}
