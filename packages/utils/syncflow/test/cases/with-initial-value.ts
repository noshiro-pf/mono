import type { DeepReadonly } from '@noshiro/ts-utils';
import type { Observable, TimerObservable } from '../../src';
import {
  combineLatest,
  interval,
  take,
  timer,
  withInitialValue,
} from '../../src';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise';
import type { StreamTestCase } from '../typedef';

/*
                        : 0    1    2    3    4    5    6    7    8    9    10
  counter               : 0         1         2         3         4         5
  timer                 :                                    0
  timerWithInitialValue : -1                                 0
  combineLatest1        :                                    [3,0][4,0]     [5,0]
  combineLatest2        : [0,-1]    [1,-1]    [2,-1]   [3,-1][3,0][4,0]     [5,0]
*/

const createStreams = (
  tick: number
): Readonly<{
  startSource: () => void;
  counter$: Observable<number>;
  timer$: TimerObservable;
  combineLatest1$: Observable<readonly [number, number]>;
  combineLatest2$: Observable<readonly [number, number]>;
}> => {
  const interval$ = interval(tick * 2, true);
  const counter$ = interval$.chain(take(6));

  const timer$ = timer(tick * 7, true);

  const combineLatest1$ = combineLatest([counter$, timer$] as const);
  const combineLatest2$ = combineLatest([
    counter$,
    timer$.chain(withInitialValue(-1)),
  ] as const);

  return {
    startSource: () => {
      timer$.start();
      interval$.start();
    },
    counter$,
    timer$,
    combineLatest1$,
    combineLatest2$,
  };
};

export const withInitialValueTestCases: readonly [
  StreamTestCase<[number, number]>,
  StreamTestCase<[number, number]>
] = [
  {
    name: 'withInitialValue case 1',
    expectedOutput: [
      [3, 0],
      [4, 0],
      [5, 0],
    ],
    run: (tick: number): Promise<DeepReadonly<[number, number][]>> => {
      const { startSource, combineLatest1$ } = createStreams(tick);
      return getStreamOutputAsPromise(combineLatest1$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, timer$, combineLatest1$ } =
        createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      timer$.subscribe((a) => {
        console.log('timer', a);
      });
      combineLatest1$.subscribe((a) => {
        console.log('combineLatest1', a);
      });

      startSource();
    },
  },
  {
    name: 'withInitialValue case 2',
    expectedOutput: [
      [0, -1],
      [1, -1],
      [2, -1],
      [3, -1],
      [3, 0],
      [4, 0],
      [5, 0],
    ],
    run: (tick: number): Promise<DeepReadonly<[number, number][]>> => {
      const { startSource, combineLatest2$ } = createStreams(tick);
      return getStreamOutputAsPromise(combineLatest2$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, timer$, combineLatest2$ } =
        createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      timer$.subscribe((a) => {
        console.log('timer', a);
      });
      combineLatest2$.subscribe((a) => {
        console.log('combineLatest2', a);
      });

      startSource();
    },
  },
];
