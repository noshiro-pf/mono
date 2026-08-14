import { type SafeUint } from 'ts-type-forge';

export type NumIconFilterState = Readonly<{
  enabled: boolean;
  min: SafeUint;
  max: SafeUint;
}>;
