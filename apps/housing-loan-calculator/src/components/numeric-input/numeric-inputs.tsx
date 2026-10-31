import type { Bindable, JSX } from 'synstate-dom';
import { Uint32 } from 'ts-data-forge';
import { PercentFloat, Year, Yen } from '../../types/index.mjs';
import { BoundedNumericInput } from './bounded-numeric-input.js';

type Props<N extends number> = Readonly<{
  value: Bindable<N>;
  onValueChange: (value: N) => void;
  'data-e2e': string;
}>;

export const YenNumericInput = (
  props: Props<Yen> & Readonly<{ min: number }>,
): JSX.Element => <BoundedNumericInput {...props} toValue={Yen.cast} />;

export const YearNumericInput = (
  props: Props<Year> & Readonly<{ min: number }>,
): JSX.Element => (
  // The bound of a uint32, which `Year.cast` refuses beyond.
  <BoundedNumericInput
    {...props}
    integer
    max={Uint32.MAX_VALUE}
    toValue={Year.cast}
  />
);

export const PercentFloatNumericInput = (
  props: Props<PercentFloat>,
): JSX.Element => (
  <BoundedNumericInput
    {...props}
    max={100}
    min={0}
    toValue={PercentFloat.cast}
  />
);
