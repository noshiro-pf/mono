export const castReadonly = <T,>(mutable: T): Readonly<T> =>
  // eslint-disable-next-line no-restricted-syntax
  mutable as Readonly<T>;

export const castDeepReadonly = <T,>(mutable: T): DeepReadonly<T> =>
  // eslint-disable-next-line no-restricted-syntax
  mutable as DeepReadonly<T>;
