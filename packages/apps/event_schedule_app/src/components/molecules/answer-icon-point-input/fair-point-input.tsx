import type { AnswerIconPoint } from '@noshiro/event-schedule-app-shared';
import { memoNamed, useState } from '@noshiro/react-utils';
import { useCallback, useEffect, useMemo } from 'react';
import { answerIconPointConfig, defaultIconPoint } from '../../../constants';
import { clampAndRoundAnswerFairIconPoint } from '../../../functions';
import { NumericInputView } from '../../bp';

type Props = Readonly<{
  value: AnswerIconPoint;
  onValueChange: (value: AnswerIconPoint) => void;
  disabled: boolean;
}>;

const { step } = answerIconPointConfig;

const defaultValue = defaultIconPoint.fair;

const sanitizeValue = (value: number): AnswerIconPoint =>
  !Number.isFinite(value)
    ? defaultValue
    : clampAndRoundAnswerFairIconPoint(value);

export const AnswerIconFairPointInput = memoNamed<Props>(
  'AnswerIconFairPointInput',
  ({ value: valueFromProps, onValueChange, disabled }) => {
    const { state: valueStr, setState: setValueStr } = useState<string>('');

    const valueParsed = useMemo<number | undefined>(() => {
      const res = Number.parseFloat(valueStr);
      if (Number.isNaN(res)) return undefined;
      return res;
    }, [valueStr]);

    useEffect(() => {
      setValueStr(valueFromProps.toString());
    }, [valueFromProps, setValueStr]);

    const valueChangeHandler = useCallback(
      (nextValue: AnswerIconPoint) => {
        if (disabled) return;
        setValueStr(nextValue.toString());
        onValueChange(nextValue);
      },
      [disabled, onValueChange, setValueStr]
    );

    const onInputBlur = useCallback(() => {
      if (disabled) return;

      const nextValue =
        valueParsed === undefined ? defaultValue : sanitizeValue(valueParsed);

      valueChangeHandler(nextValue);
    }, [disabled, valueParsed, valueChangeHandler]);

    const onIncrementClick = useCallback(() => {
      if (disabled) return;

      const nextValue =
        valueParsed === undefined
          ? defaultValue
          : sanitizeValue(valueParsed + step);

      valueChangeHandler(nextValue);
    }, [disabled, valueParsed, valueChangeHandler]);

    const onDecrementClick = useCallback(() => {
      if (disabled) return;

      const nextValue =
        valueParsed === undefined
          ? defaultValue
          : sanitizeValue(valueParsed - step);

      valueChangeHandler(nextValue);
    }, [disabled, valueParsed, valueChangeHandler]);

    return (
      <NumericInputView
        disabled={disabled}
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
