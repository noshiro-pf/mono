export const castWritable = <T>(mutable: T): DeepWritable<T> =>
  mutable as DeepWritable<T>;
