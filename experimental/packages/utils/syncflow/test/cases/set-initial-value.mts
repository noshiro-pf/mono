import {
  combine,
  interval,
  setInitialValue,
  take,
  timer,
  type Observable,
  type TimerObservable,
} from '../../src/index.mjs';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise.mjs';
import { type StreamTestCase } from '../typedef.mjs';

/*
                        : 0    1    2    3    4    5    6    7    8    9    10
  counter               : 0         1         2         3         4         5
  timer                 :                                    0
  timerWithInitialValue : -1                                 0
  combine1        :                                    [3,0][4,0]     [5,0]
  combine2        : [0,-1]    [1,-1]    [2,-1]   [3,-1][3,0][4,0]     [5,0]
*/

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  timer$: TimerObservable;
  combined1$: Observable<readonly [number, number]>;
  combined2$: Observable<readonly [number, number]>;
}> => {
  const interval$ = interval(tick * 2, true);
  const counter$ = interval$.chain(take(6));

  const timer$ = timer(tick * 7, true);

  const combined1$ = combine([counter$, timer$]);
  const combined2$ = combine([counter$, timer$.chain(setInitialValue(-1))]);

  return {
    startSource: () => {
      timer$.start();
      interval$.start();
    },
    counter$,
    timer$,
    combined1$,
    combined2$,
  };
};

export const setInitialValueTestCases: readonly [
  StreamTestCase<[number, number]>,
  StreamTestCase<[number, number]>,
] = [
  {
    name: 'setInitialValue case 1',
    expectedOutput: [
      [3, 0],
      [4, 0],
      [5, 0],
    ],
    run: (tick: number): Promise<DeepReadonly<[number, number][]>> => {
      const { startSource, combined1$ } = createStreams(tick);
      return getStreamOutputAsPromise(combined1$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, timer$, combined1$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter  ', a);
      });
      timer$.subscribe((a) => {
        console.log('timer    ', a);
      });
      combined1$.subscribe((a) => {
        console.log('combined1', a);
      });

      startSource();
    },
  },
  {
    name: 'setInitialValue case 2',
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
      const { startSource, combined2$ } = createStreams(tick);
      return getStreamOutputAsPromise(combined2$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, timer$, combined2$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter  ', a);
      });
      timer$.subscribe((a) => {
        console.log('timer    ', a);
      });
      combined2$.subscribe((a) => {
        console.log('combined2', a);
      });

      startSource();
    },
  },
];
