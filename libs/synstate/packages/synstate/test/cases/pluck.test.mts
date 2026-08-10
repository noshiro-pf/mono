import { type SafeUint } from 'ts-type-forge';
import {
  counter,
  map,
  pluck,
  take,
  type Observable,
} from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { testStream } from '../test-stream.mjs';
import { type StreamTestCase } from '../typedef.mjs';

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  pluck$: Observable<string>;
}> => {
  const counter$ = counter(tick, { startManually: true });

  const counter5$ = counter$.pipe(take(5));

  const pluck$ = counter5$
    .pipe(map((i) => ({ x: i.toString() })))
    .pipe(pluck('x'));

  return {
    startSource: () => {
      counter$.start();
    },
    counter$: counter5$,
    pluck$,
  };
};

export const pluckTestCases: readonly [StreamTestCase<string>] = [
  {
    name: 'pluck case 1',
    expectedOutput: ['0', '1', '2', '3', '4'],
    run: (tick: number): Promise<readonly string[]> => {
      const { startSource, pluck$ } = createStreams(tick);

      return getStreamHistoryAsPromise(pluck$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, pluck$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });

      pluck$.subscribe((a) => {
        console.log('pluck  ', a);
      });

      startSource();
    },
  },
] as const;

for (const c of pluckTestCases) {
  testStream(c);
}
