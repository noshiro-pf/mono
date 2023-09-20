export const castReadonly = <T>(mutable: T): Readonly<T> =>
  mutable as Readonly<T>;

export const castDeepReadonly = <T>(mutable: T): DeepReadonly<T> =>
  mutable as DeepReadonly<T>;
