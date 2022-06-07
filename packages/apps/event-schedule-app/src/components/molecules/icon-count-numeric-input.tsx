import { clampAndRoundNumIcons } from '../../functions';
import { NumericInputView } from '../bp';

type Props = Readonly<{
  count: number;
  max: number;
  disabled: boolean;
  onCountChange: (value: number) => void;
}>;

const defaultValue = 0;

export const IconCountNumericInput = memoNamed<Props>(
  'IconCountNumericInput',
  ({ count: valueFromProps, max, disabled, onCountChange: onValueChange }) => {
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

    const sanitizeValue = useCallback(
      (value: number): number => clampAndRoundNumIcons(value, max),
      [max]
    );

    const onInputBlur = useCallback(() => {
      const nextValue =
        valueParsed === undefined ? defaultValue : sanitizeValue(valueParsed);

      valueChangeHandler(nextValue);
    }, [valueParsed, valueChangeHandler, sanitizeValue]);

    const onIncrementClick = useCallback(() => {
      const nextValue =
        valueParsed === undefined
          ? defaultValue
          : sanitizeValue(valueParsed + 1);

      valueChangeHandler(nextValue);
    }, [valueParsed, valueChangeHandler, sanitizeValue]);

    const onDecrementClick = useCallback(() => {
      const nextValue =
        valueParsed === undefined
          ? defaultValue
          : sanitizeValue(valueParsed - 1);

      valueChangeHandler(nextValue);
    }, [valueParsed, valueChangeHandler, sanitizeValue]);

    const inputProps = useMemo(() => ({ min: 0, max }), [max]);

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
