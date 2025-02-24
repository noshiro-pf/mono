export function zeros<N extends SmallUint>(len: N): ArrayOfLength<N, 0>;
export function zeros(len: PositiveSafeIntWithSmallInt): NonEmptyArray<0>;
export function zeros(len: number): readonly 0[] {
  return Array.from({ length: len }, () => 0);
}

export const castMutable = <T,>(mutable: T): Mutable<T> =>
  mutable as Mutable<T>;

export const castDeepMutable = <T,>(mutable: T): DeepMutable<T> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  mutable as DeepMutable<T>;
