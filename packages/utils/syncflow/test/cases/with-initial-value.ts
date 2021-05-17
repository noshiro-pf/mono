import type {
  IntervalObservable,
  Observable,
  TimerObservable,
} from '../../src';
import { combineLatest, interval, timer, withInitialValue } from '../../src';
import { getStreamOutputAsPromise } from '../get-strem-output-as-promise';
import type { StreamTestCase } from '../typedef';

const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  timer$: TimerObservable;
  combineLatest1$: Observable<[number, number]>;
  combineLatest2$: Observable<[number, number]>;
} => {
  const counter$ = interval(tick * 2, true);
  const timer$ = timer(tick * 11, true);

  const combineLatest1$ = combineLatest(counter$, timer$);
  const combineLatest2$ = combineLatest(
    counter$,
    timer$.chain(withInitialValue(-1))
  );

  return {
    counter$,
    timer$,
    combineLatest1$,
    combineLatest2$,
  };
};

export const withInitialValueTestCases: [
  StreamTestCase<[number, number]>,
  StreamTestCase<[number, number]>
] = [
  {
    name: 'withInitialValue case 1',
    expectedOutput: [
      [4, 0],
      [5, 0],
      [6, 0],
      [7, 0],
      [8, 0],
    ],
    run: (take: number, tick: number): Promise<[number, number][]> => {
      const { counter$, timer$, combineLatest1$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        combineLatest1$,
        take,
        () => {
          timer$.start();
          counter$.start();
        },
        () => {
          timer$.complete();
          counter$.complete();
        }
      );
    },
    preview: (tick: number): void => {
      const { counter$, timer$, combineLatest1$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      timer$.subscribe((a) => {
        console.log('timer', a);
      });
      combineLatest1$.subscribe((a) => {
        console.log('combineLatest1', a);
      });

      timer$.start();
      counter$.start();
    },
  },
  {
    name: 'withInitialValue case 2',
    expectedOutput: [
      [0, -1],
      [1, -1],
      [2, -1],
      [3, -1],
      [4, -1],
      [4, 0],
      [5, 0],
      [6, 0],
      [7, 0],
      [8, 0],
      [9, 0],
    ],
    run: (take: number, tick: number): Promise<[number, number][]> => {
      const { counter$, timer$, combineLatest2$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        combineLatest2$,
        take,
        () => {
          timer$.start();
          counter$.start();
        },
        () => {
          timer$.complete();
          counter$.complete();
        }
      );
    },
    preview: (tick: number): void => {
      const { counter$, timer$, combineLatest2$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      timer$.subscribe((a) => {
        console.log('timer', a);
      });
      combineLatest2$.subscribe((a) => {
        console.log('combineLatest2', a);
      });

      timer$.start();
      counter$.start();
    },
  },
];
