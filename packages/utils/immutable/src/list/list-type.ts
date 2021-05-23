export type IList<T> = {
  size: number;
  length: number;
  get: (index: number) => T | undefined;
  // set: (index: number, value: T) => IList<T>;
};
