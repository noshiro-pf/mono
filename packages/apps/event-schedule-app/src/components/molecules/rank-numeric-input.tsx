import {
  answerRankNumericInputConfig,
  clampAndRoundAnswerRank,
} from '../../constants';
import { type AnswerRank } from '../../types';
import { NumericInputView, useNumericInputState } from '../bp';

type Props = Readonly<{
  value: AnswerRank;
  disabled?: boolean;
  onValueChange: (value: AnswerRank) => void;
}>;

const step = answerRankNumericInputConfig.majorStep;
const defaultValue = answerRankNumericInputConfig.defaultValue;

const normalizeValue = clampAndRoundAnswerRank;

export const RankNumericInput = memoNamed<Props>(
  'RankNumericInput',
  ({ value: valueFromProps, disabled = false, onValueChange }) => {
    const {
      valueAsStr,
      setValueStr,
      onDecrementMouseDown,
      onIncrementMouseDown,
      onInputBlur,
      onKeyDown,
    } = useNumericInputState({
      onValueChange,
      defaultValue,
      normalizeValue,
      valueFromProps,
      step,
    });

    const inputProps = useMemo(
      () => ({
        min: answerRankNumericInputConfig.min,
        max: answerRankNumericInputConfig.max,
        step,
        onKeyDown,
      }),
      [onKeyDown],
    );

    return (
      <NumericInputView
        disabled={disabled}
        fillSpace={true}
        inputProps={inputProps}
        selectOnFocus={true}
        valueAsStr={valueAsStr}
        onDecrementMouseDown={onDecrementMouseDown}
        onIncrementMouseDown={onIncrementMouseDown}
        onInputBlur={onInputBlur}
        onInputStringChange={setValueStr}
      />
    );
  },
);
