import { Result } from '@noshiro/ts-utils';
import type { Observable } from '../../src';
import { fromPromise } from '../../src';
import { getStreamOutputAsPromise } from '../get-strem-output-as-promise';
import type { StreamTestCase } from '../typedef';

const valueToEmit = 1;

const createStream = (tick: number): Observable<Result<number, unknown>> => {
  const promise = new Promise<number>((resolve) => {
    setTimeout(() => {
      resolve(valueToEmit);
    }, tick);
  });
  return fromPromise(promise);
};

export const fromPromiseTestCases: [StreamTestCase<Result<number, unknown>>] = [
  {
    name: 'fromPromise case 1',
    expectedOutput: [Result.ok(valueToEmit)],
    run: (take: number, tick: number): Promise<Result<number, unknown>[]> => {
      const source$ = createStream(tick);
      return getStreamOutputAsPromise(source$, take, () => null);
    },
    preview: (tick: number): void => {
      const source$ = createStream(tick);
      source$.subscribe((a) => {
        console.log('fromPromise', a);
      });
    },
  },
];
