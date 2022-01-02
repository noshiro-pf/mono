import type { Weight } from '@noshiro/event-schedule-app-shared';
import { createWeight } from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { weightNumericInputConfig } from '../../constants';
import { clampAndRoundAnswerWeight } from '../../functions';
import { NumericInputView } from '../bp';

type Props = Readonly<{
  weight: Weight;
  onWeightChange: (value: Weight) => void;
}>;

const { step } = weightNumericInputConfig;

const defaultValue = createWeight(1);

const sanitizeValue = (value: number): Weight =>
  !Number.isFinite(value) ? defaultValue : clampAndRoundAnswerWeight(value);

export const WeightNumericInput = memoNamed<Props>(
  'WeightNumericInput',
  ({ weight: valueFromProps, onWeightChange: onValueChange }) => {
    const [valueStr, setValueStr] = useState<string>('');

    const valueParsed = useMemo<number | undefined>(() => {
      const res = parseFloat(valueStr);
      if (Number.isNaN(res)) return undefined;
      return res;
    }, [valueStr]);

    useEffect(() => {
      setValueStr(valueFromProps.toString());
    }, [valueFromProps]);

    const valueChangeHandler = useCallback(
      (nextValue: Weight) => {
        setValueStr(nextValue.toString());
        onValueChange(nextValue);
      },
      [onValueChange]
    );

    const onInputBlur = useCallback(() => {
      const nextValue =
        valueParsed === undefined ? defaultValue : sanitizeValue(valueParsed);

      valueChangeHandler(nextValue);
    }, [valueParsed, valueChangeHandler]);

    const onIncrementClick = useCallback(() => {
      const nextValue =
        valueParsed === undefined
          ? defaultValue
          : sanitizeValue(valueParsed + step);

      valueChangeHandler(nextValue);
    }, [valueParsed, valueChangeHandler]);

    const onDecrementClick = useCallback(() => {
      const nextValue =
        valueParsed === undefined
          ? defaultValue
          : sanitizeValue(valueParsed - step);

      valueChangeHandler(nextValue);
    }, [valueParsed, valueChangeHandler]);

    return (
      <NumericInputView
        fillSpace={true}
        selectOnFocus={true}
        valueAsStr={valueStr}
        onDecrementClick={onDecrementClick}
        onIncrementClick={onIncrementClick}
        onInputBlur={onInputBlur}
        onInputStringChange={setValueStr}
      />
    );
  }
);
