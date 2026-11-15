import type { optionalValue, optionalVariant } from 'ts-std-forge-keys';

// ts-std-forge-keys publishes declarations only, so its check is a compile, not
// a run. `tsc --noEmit` failing on any of these is the assertion.

const expectTrue = <_T extends true>(): void => undefined;

// Both keys are symbols, and two different ones.
expectTrue<typeof optionalVariant extends symbol ? true : false>();

expectTrue<
  [typeof optionalVariant] extends [typeof optionalValue] ? false : true
>();

// They key a type the way ts-std-forge's `Some` is keyed.
type Keyed = Readonly<{ [optionalVariant]: 'some'; [optionalValue]: number }>;

expectTrue<Keyed[typeof optionalVariant] extends 'some' ? true : false>();

export type { Keyed };
