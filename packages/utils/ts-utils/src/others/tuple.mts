export const tp = <T extends readonly unknown[]>(...args: T): Readonly<T> =>
  args;
