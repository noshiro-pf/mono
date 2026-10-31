import type { Bindable, JSX } from 'synstate-dom';
import {
  maxPercent,
  maxYear,
  minPercent,
  minYear,
  PercentFloat,
  Year,
  Yen,
} from '../../types/index.mjs';
import { BoundedNumericInput } from './bounded-numeric-input.js';

type Props<N extends number> = Readonly<{
  value: Bindable<N>;
  onValueChange: (value: N) => void;
  'data-e2e': string;
}>;

export const YenNumericInput = (
  props: Props<Yen> & Readonly<{ min: number }>,
): JSX.Element => <BoundedNumericInput {...props} toValue={Yen.cast} />;

export const YearNumericInput = (props: Props<Year>): JSX.Element => (
  <BoundedNumericInput
    {...props}
    integer
    max={maxYear}
    min={minYear}
    toValue={Year.cast}
  />
);

export const PercentFloatNumericInput = (
  props: Props<PercentFloat>,
): JSX.Element => (
  <BoundedNumericInput
    {...props}
    max={maxPercent}
    min={minPercent}
    toValue={PercentFloat.cast}
  />
);
