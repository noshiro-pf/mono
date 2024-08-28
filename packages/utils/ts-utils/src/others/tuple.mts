export const tp = <const T extends readonly unknown[]>(
  ...args: T
): Readonly<T> => args;
