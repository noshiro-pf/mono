export const castMutable = <T,>(mutable: T): Mutable<T> =>
  mutable as Mutable<T>;

export const castDeepMutable = <T,>(mutable: T): DeepMutable<T> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  mutable as DeepMutable<T>;
