import { type ToNumber } from './to-number';

export type AbsoluteValue<N extends number> = N extends N
  ? `${N}` extends `-${infer P}`
    ? P extends `${number}`
      ? ToNumber<P>
      : never
    : N
  : never;
