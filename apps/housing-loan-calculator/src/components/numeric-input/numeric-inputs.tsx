import type { Bindable, JSX } from 'synstate-dom';
import {
  BorrowingTotal,
  maxBorrowingTotalManYen,
  maxPercent,
  maxYear,
  minBorrowingTotalManYen,
  minPercent,
  minYear,
  PercentFloat,
  Year,
} from '../../types/index.mjs';
import { BoundedNumericInput } from './bounded-numeric-input.js';

type Props<N extends number> = Readonly<{
  value: Bindable<N>;
  onValueChange: (value: N) => void;
  'data-e2e': string;
}>;

export const BorrowingTotalNumericInput = (
  props: Props<BorrowingTotal>,
): JSX.Element => (
  <BoundedNumericInput
    {...props}
    max={maxBorrowingTotalManYen}
    min={minBorrowingTotalManYen}
    toValue={BorrowingTotal.cast}
  />
);

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
