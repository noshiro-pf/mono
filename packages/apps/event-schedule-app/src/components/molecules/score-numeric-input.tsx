import {
  answersScoreNumericInputConfig,
  clampAndRoundAnswersScore,
} from '../../constants';
import type { AnswersScore } from '../../types';
import { NumericInputView } from '../bp';

type Props = Readonly<{
  value: AnswersScore;
  disabled?: boolean;
  min?: AnswersScore;
  max?: AnswersScore;
  onValueChange: (value: AnswersScore) => void;
}>;

const step = answersScoreNumericInputConfig.majorStep;
const defaultValue = answersScoreNumericInputConfig.defaultValue;

export const ScoreNumericInput = memoNamed<Props>(
  'ScoreNumericInput',
  ({
    value: valueFromProps,
    disabled = false,
    min = answersScoreNumericInputConfig.min,
    max = answersScoreNumericInputConfig.max,
    onValueChange,
  }) => {
    const { state: valueStr, setState: setValueStr } = useState<string>('');

    const inputProps = useMemo(() => ({ min, max, step }), [min, max]);

    const normalizeValue = useCallback(
      (value: number) => clampAndRoundAnswersScore(Num.clamp(min, max)(value)),
      [min, max]
    );

    const valueParsed = useMemo<number | undefined>(() => {
      const res = Num.parseFloat(valueStr);
      if (res === undefined || Num.isNaN(res)) return undefined;
      return res;
    }, [valueStr]);

    useEffect(() => {
      setValueStr(valueFromProps.toString());
    }, [valueFromProps, setValueStr]);

    const valueChangeHandler = useCallback(
      (nextValue: number | undefined) => {
        if (disabled) return;

        const valueNormalized =
          nextValue === undefined ? defaultValue : normalizeValue(nextValue);

        setValueStr(valueNormalized.toString());
        onValueChange(valueNormalized);
      },
      [disabled, normalizeValue, setValueStr, onValueChange]
    );

    const onInputBlur = useCallback(() => {
      valueChangeHandler(valueParsed);
    }, [valueParsed, valueChangeHandler]);

    const onIncrementClick = useCallback(() => {
      valueChangeHandler(
        pipe(valueParsed).chainNullable((x) => x + step).value
      );
    }, [valueParsed, valueChangeHandler]);

    const onDecrementClick = useCallback(() => {
      valueChangeHandler(
        pipe(valueParsed).chainNullable((x) => x - step).value
      );
    }, [valueParsed, valueChangeHandler]);

    return (
      <NumericInputView
        disabled={disabled}
        fillSpace={true}
        inputProps={inputProps}
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
