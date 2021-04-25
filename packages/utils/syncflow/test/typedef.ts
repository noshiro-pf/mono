export type StreamTestCase<T> = Readonly<{
  name: string;
  expectedOutput: readonly T[];
  run:
    | ((take: number, tick: number) => Promise<T[]>)
    | ((take: number) => Promise<T[]>);
  preview: (() => void) | ((tick: number) => void);
}>;
