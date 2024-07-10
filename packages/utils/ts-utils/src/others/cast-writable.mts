export const castMutable = <T,>(mutable: T): Mutable<T> =>
  // eslint-disable-next-line no-restricted-syntax
  mutable as Mutable<T>;

export const castDeepMutable = <T,>(mutable: T): DeepMutable<T> =>
  // eslint-disable-next-line no-restricted-syntax
  mutable as DeepMutable<T>;
