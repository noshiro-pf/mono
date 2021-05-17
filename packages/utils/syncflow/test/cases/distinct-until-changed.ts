import type { IntervalObservable, Observable } from '../../src';
import { distinctUntilChanged, interval, map, withLatestFrom } from '../../src';
import { getStreamOutputAsPromise } from '../get-strem-output-as-promise';
import type { StreamTestCase } from '../typedef';

/*
  counter                0   1   2   3   4   5   6
  distinctUntilChanged   0           1           2
  throttleTime           00  1   2   31  4   5   6
*/

const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  distinctUntilChanged$: Observable<number>;
  withLatest$: Observable<[number, number]>;
} => {
  const counter$ = interval(tick, true);

  const distinctUntilChanged$ = counter$
    .chain(map((i) => Math.floor(i / 3)))
    .chain(distinctUntilChanged());

  const withLatest$ = distinctUntilChanged$.chain(withLatestFrom(counter$));

  return {
    counter$,
    distinctUntilChanged$,
    withLatest$,
  };
};

export const distinctUntilChangedTestCases: [StreamTestCase<[number, number]>] =
  [
    {
      name: 'distinctUntilChanged case 1',
      expectedOutput: [
        [0, 0],
        [1, 3],
        [2, 6],
        [3, 9],
      ],
      run: (take: number, tick: number): Promise<[number, number][]> => {
        const { counter$, withLatest$ } = createStreams(tick);
        return getStreamOutputAsPromise(
          withLatest$,
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
        const { counter$, distinctUntilChanged$, withLatest$ } =
          createStreams(tick);

        counter$.subscribe((a) => {
          console.log('counter', a);
        });
        distinctUntilChanged$.subscribe((a) => {
          console.log('distinctUntilChanged', a);
        });
        withLatest$.subscribe((a) => {
          console.log('withLatest', a);
        });

        counter$.start();
      },
    },
  ];
