import type { DeepReadonly } from '@noshiro/ts-utils';
import type { Observable } from '../../src';
import { filter, interval, take, withBufferedFrom } from '../../src';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise';
import type { StreamTestCase } from '../typedef';

const createStreams = (
  tick: number
): Readonly<{
  startSource: () => void;
  counter$: Observable<number>;
  withBufferedFrom$: Observable<DeepReadonly<[number, number[]]>>;
}> => {
  const interval$ = interval(tick, true);
  const counter$ = interval$.chain(take(11));

  const filtered$ = counter$.chain(filter((x) => x % 3 !== 0));
  const sampleInterval$ = interval(tick * 3);
  const sampleCounter$ = sampleInterval$.chain(take(5));

  const withBufferedFrom$ = sampleCounter$.chain(withBufferedFrom(filtered$));

  return {
    startSource: () => {
      interval$.start();
      sampleInterval$.start();
    },
    counter$,
    withBufferedFrom$,
  };
};

export const withBufferedFromTestCases: readonly [
  StreamTestCase<[number, number[]]>
] = [
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
    run: (tick: number): Promise<DeepReadonly<[number, number[]][]>> => {
      const { startSource, withBufferedFrom$ } = createStreams(tick);
      return getStreamOutputAsPromise(withBufferedFrom$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, withBufferedFrom$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      withBufferedFrom$.subscribe((a) => {
        console.log('withLatest', a);
      });

      startSource();
    },
  },
];
