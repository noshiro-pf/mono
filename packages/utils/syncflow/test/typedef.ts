import type { DeepReadonly } from '@noshiro/ts-utils';

export type StreamTestCase<T> = StreamTestCaseImpl<T>;

type StreamTestCaseImpl<T, O = DeepReadonly<T[]>> = Readonly<{
  name: string;
  expectedOutput: O;
  run: (tick: number) => Promise<O>;
  preview: (tick: number) => void;
}>;
