export type StreamTestCase<T> = {
  name: string;
  expectedOutput: readonly T[];
  run:
    | ((take: number, tick: number) => Promise<T[]>)
    | ((take: number) => Promise<T[]>);
  preview: ((tick: number) => void) | (() => void);
};
