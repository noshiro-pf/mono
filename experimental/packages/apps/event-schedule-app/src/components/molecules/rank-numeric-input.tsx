import { useNumericInputWithStepState } from '@noshiro/numeric-input-utils';
import { NumericInputView } from '@noshiro/react-blueprintjs-utils';
import {
  answerRankNumericInputConfig,
  clampAndRoundAnswerRank,
} from '../../constants';
import { type AnswerRank } from '../../types';

type Props = Readonly<{
  value: AnswerRank;
  onValueChange: (value: AnswerRank) => void;
  disabled?: boolean;
}>;

const { majorStep: step, min, max } = answerRankNumericInputConfig;

export const RankNumericInput = memoNamed<Props>(
  'RankNumericInput',
  ({ value: valueFromProps, disabled = false, onValueChange }) => {
    const {
      state,
      setState,
      onDecrementMouseDown,
      onIncrementMouseDown,
      submit,
      onKeyDown,
    } = useNumericInputWithStepState({
      onValueChange,
      normalize: clampAndRoundAnswerRank,
      decode: (s) => clampAndRoundAnswerRank(Number(s)),
      encode: (s) => s.toString(),
      valueFromProps,
      step,
    });

    const inputProps = useMemo(
      () => ({
        min,
        max,
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
        valueAsStr={state}
        onDecrementMouseDown={onDecrementMouseDown}
        onIncrementMouseDown={onIncrementMouseDown}
        onInputBlur={submit}
        onInputStringChange={setState}
      />
    );
  },
);
