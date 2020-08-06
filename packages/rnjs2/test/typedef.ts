export type StreamTestCase<T> = {
  name: string;
  numTakeDefault: number;
  run:
    | ((take: number, tick: number) => Promise<T[]>)
    | ((take: number) => Promise<T[]>);
  preview: ((tick: number) => void) | (() => void);
};
