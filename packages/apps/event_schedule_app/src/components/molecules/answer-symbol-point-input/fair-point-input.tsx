import type { AnswerSymbolPoint } from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  answerSymbolPointConfig,
  defaultSymbolPoint,
} from '../../../constants';
import { clampAndRoundAnswerFairSymbolPoint } from '../../../functions';
import { NumericInputView } from '../../bp';

type Props = Readonly<{
  value: AnswerSymbolPoint;
  onValueChange: (value: AnswerSymbolPoint) => void;
  disabled: boolean;
}>;

const { step } = answerSymbolPointConfig;

const defaultValue = defaultSymbolPoint.fair;

const sanitizeValue = (value: number): AnswerSymbolPoint =>
  !Number.isFinite(value)
    ? defaultValue
    : clampAndRoundAnswerFairSymbolPoint(value);

export const AnswerSymbolFairPointInput = memoNamed<Props>(
  'AnswerSymbolFairPointInput',
  ({ value: valueFromProps, onValueChange, disabled }) => {
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
      (nextValue: AnswerSymbolPoint) => {
        if (disabled) return;
        setValueStr(nextValue.toString());
        onValueChange(nextValue);
      },
      [disabled, onValueChange]
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
