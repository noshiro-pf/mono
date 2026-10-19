import {
  combine,
  createSyncChildObservable,
  source,
  type Observable,
} from 'synstate';
import { Optional } from 'ts-data-forge';
import type { FixedLengthTuple } from 'ts-type-forge';

// embed-sample-code-ignore-above
// A custom operator, written as `map((x) => x * 2)` is.
const double = (src: Observable<number>): Observable<number> =>
  createSyncChildObservable(
    { parents: [src], initialValue: Optional.none },
    ({ setNext }) =>
      (updateToken) => {
        const sn = src.getSnapshot();

        if (src.updateToken !== updateToken || Optional.isNone(sn)) {
          return; // `src` did not emit in this update
        }

        setNext(sn.value * 2, updateToken);
      },
  );

// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test(createSyncChildObservable, () => {
    // embed-sample-code-ignore-above

    const num$ = source<number>();

    const pair$ = combine([num$, double(num$)]);

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: FixedLengthTuple<2, number>[] = [];

    pair$.subscribe((pair) => {
      valueHistory.push(pair);
    });

    num$.next(1);

    num$.next(2);

    // `double` joins the same update as `num$`, so `combine` sees no [2, 2].
    assert.deepStrictEqual(valueHistory, [
      [1, 2],
      [2, 4],
    ]);

    // embed-sample-code-ignore-below
  });
}
