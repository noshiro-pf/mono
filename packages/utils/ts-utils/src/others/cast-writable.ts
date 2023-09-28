export const castWritable = <T>(mutable: T): Writable<T> =>
  // eslint-disable-next-line no-restricted-syntax
  mutable as Writable<T>;

export const castDeepWritable = <T>(mutable: T): DeepWritable<T> =>
  // eslint-disable-next-line no-restricted-syntax
  mutable as DeepWritable<T>;
