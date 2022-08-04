import {
  clampAndRoundAnswerWeight,
  weightNumericInputConfig,
} from '../../constants';
import { NumericInputView } from '../bp';

type Props = Readonly<{
  weight: Weight;
  onWeightChange: (value: Weight) => void;
  disabled?: boolean;
}>;

const { step, defaultValue, min, max } = weightNumericInputConfig;

const inputProps = { min, max, step };

const normalizeValue = clampAndRoundAnswerWeight;

export const WeightNumericInput = memoNamed<Props>(
  'WeightNumericInput',
  ({
    weight: valueFromProps,
    disabled = false,
    onWeightChange: onValueChange,
  }) => {
    const { state: valueStr, setState: setValueStr } = useState<string>('');

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
      [disabled, setValueStr, onValueChange]
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
