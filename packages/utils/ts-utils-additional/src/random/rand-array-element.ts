import { Arr, SafeUint } from '@noshiro/ts-utils';

export const randomArrayElement = <T>(array: NonEmptyArray<T>): T =>
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  array[SafeUint.random(0, SafeUint.sub(Arr.length(array), 1))]!;
