// The prelude's Result.fromThrowable is the only place exceptions are caught.
const fromThrowable = <T,>(run: () => T): T | undefined => run();

export const parse = (text: string): unknown =>
  fromThrowable(() => JSON.parse(text));
