export const castWritable = <T>(mutable: T): Writable<T> =>
  mutable as Writable<T>;

export const castDeepWritable = <T>(mutable: T): DeepWritable<T> =>
  mutable as DeepWritable<T>;
