import { fromPromise } from '../../src/create';
import { StreamTestCase } from '../typedef';
import { getStreamOutputAsPromise } from '../utils';

const valueToEmit = 1;

const createStream = (tick: number) => {
  const promise = new Promise<number>((resolve) => {
    setTimeout(() => resolve(valueToEmit), tick);
  });
  return fromPromise(promise);
};

export const fromPromiseTestCases: StreamTestCase<number>[] = [
  {
    name: 'fromPromise case 1',
    numTakeDefault: 1,
    run: (take: number, tick: number): Promise<number[]> => {
      const source$ = createStream(tick);
      return getStreamOutputAsPromise(source$, take, () => null);
    },
    preview: (tick: number): void => {
      const source$ = createStream(tick);
      source$.subscribe((a) => console.log('fromPromise', a));
    },
  },
];
