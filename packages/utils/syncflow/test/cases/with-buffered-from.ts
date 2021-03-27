import {
  filter,
  interval,
  IntervalObservable,
  Observable,
  withBufferedFrom,
} from '../../src';
import { getStreamOutputAsPromise } from '../get-strem-output-as-promise';
import { StreamTestCase } from '../typedef';

const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  withBufferedFrom$: Observable<[number, number[]]>;
} => {
  const counter$ = interval(tick, true);
  const filtered$ = counter$.chain(filter((x) => x % 3 !== 0));
  const sample$ = interval(tick * 3, true);

  const withBufferedFrom$ = sample$.chain(withBufferedFrom(filtered$));

  return {
    counter$,
    withBufferedFrom$,
  };
};

export const withBufferedFromTestCases: [StreamTestCase<[number, number[]]>] = [
  {
    name: 'withLatestFrom case 1',
    expectedOutput: [
      [0, [1, 2]],
      [1, [4, 5]],
      [2, [7, 8]],
      [3, [10, 11]],
      [4, [13, 14]],
      [5, [16, 17]],
      [6, [19, 20]],
      [7, [22, 23]],
      [8, [25, 26]],
      [9, [28, 29]],
      [10, [31, 32]],
    ],
    run: (take: number, tick: number): Promise<[number, number[]][]> => {
      const { counter$, withBufferedFrom$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        withBufferedFrom$,
        take,
        () => {
          counter$.start();
        },
        () => {
          counter$.complete();
        }
      );
    },
    preview: (tick: number): void => {
      const { counter$, withBufferedFrom$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      withBufferedFrom$.subscribe((a) => {
        console.log('withLatest', a);
      });

      counter$.start();
    },
  },
];
