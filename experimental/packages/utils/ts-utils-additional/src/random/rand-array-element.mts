import { Arr, Uint32 } from '@noshiro/ts-utils';

export const randomArrayElement = <T,>(array: NonEmptyArray<T>): T =>
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  array[Uint32.random(0, Uint32.sub(Arr.length(array), 1))]!;
