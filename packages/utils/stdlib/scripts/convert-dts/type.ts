/* eslint-disable functional/prefer-readonly-type */

export type Pipe = Readonly<{
  value: string;
  chain: (fn: (a: string) => string) => Pipe;
}>;
