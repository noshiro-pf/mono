import type { Observable } from '../../src';
import { fromArray } from '../../src';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise';
import type { StreamTestCase } from '../typedef';

const createStream = (): Readonly<{
  startSource: () => void;
  output$: Observable<number>;
}> => {
  const source$ = fromArray([1, 1, 2, 3, 5, 8, 13, 21, 34, 55]);
  return {
    startSource: () => {
      source$.emit();
    },
    output$: source$,
  };
};

export const fromArrayTestCases: readonly [StreamTestCase<number>] = [
  {
    name: 'fromArray case 1',
    expectedOutput: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55],
    run: (): Promise<readonly number[]> => {
      const { output$, startSource } = createStream();
      return getStreamOutputAsPromise(output$, startSource);
    },
    preview: (): void => {
      const { output$, startSource } = createStream();
      output$.subscribe((a) => {
        console.log('fromArray', a);
      });
      startSource();
    },
  },
];
