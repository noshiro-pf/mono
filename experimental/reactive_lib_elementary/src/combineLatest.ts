import { Observable } from './Observable';
import { Unwrap } from './util-types';

export const combineLatest = <T extends Observable<any>[]>(
  ...srcs: T
): Observable<Unwrap<T>> => new MergeObservable(...srcs);

const INITIAL_VALUE = Symbol();

class MergeObservable<T extends Observable<any>[]> extends Observable<
  Unwrap<T>
> {
  private latestValues: any[];

  constructor(...srcs: T) {
    super();

    this.latestValues = new Array<any>(srcs.length).fill(INITIAL_VALUE);

    srcs.forEach((src, idx) => {
      src.subscribe((v) => {
        this.latestValues[idx] = v;

        if (!this.latestValues.includes(INITIAL_VALUE)) {
          this.update(this.latestValues as unknown as Unwrap<T>);
        }
      });
    });
  }
}
