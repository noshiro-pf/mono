import { weightNumericInputConfig } from '../../constants';
import { clampAndRoundAnswerWeight } from '../../functions';
import { NumericInputView } from '../bp';

type Props = Readonly<{
  weight: Weight;
  onWeightChange: (value: Weight) => void;
}>;

const { step, defaultValue } = weightNumericInputConfig;

const sanitizeValue = clampAndRoundAnswerWeight;

export const WeightNumericInput = memoNamed<Props>(
  'WeightNumericInput',
  ({ weight: valueFromProps, onWeightChange: onValueChange }) => {
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
      (nextValue: Weight) => {
        setValueStr(nextValue.toString());
        onValueChange(nextValue);
      },
      [setValueStr, onValueChange]
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
