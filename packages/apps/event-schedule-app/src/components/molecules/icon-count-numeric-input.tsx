import { clampAndRoundNumIcons } from '../../constants';
import { NumericInputView } from '../bp';

type Props = Readonly<{
  count: number;
  max: number;
  disabled?: boolean;
  onCountChange: (value: number) => void;
}>;

const defaultValue = 0;

export const IconCountNumericInput = memoNamed<Props>(
  'IconCountNumericInput',
  ({ count: valueFromProps, max, disabled = false, onCountChange }) => {
    const { state: valueStr, setState: setValueStr } = useState<string>('');

    const valueParsed = useMemo<number | undefined>(() => {
      const res = Num.parseFloat(valueStr);
      if (res === undefined || Num.isNaN(res)) return undefined;
      return res;
    }, [valueStr]);

    useEffect(() => {
      setValueStr(valueFromProps.toString());
    }, [valueFromProps, setValueStr]);

    const sanitizeValue = useCallback(
      (value: number): number => clampAndRoundNumIcons(value, max),
      [max]
    );

    const valueChangeHandler = useCallback(
      (nextValue: number | undefined) => {
        if (disabled) return;

        const valueSanitized =
          nextValue === undefined ? defaultValue : sanitizeValue(nextValue);

        setValueStr(valueSanitized.toString());
        onCountChange(valueSanitized);
      },
      [disabled, sanitizeValue, setValueStr, onCountChange]
    );

    const onInputBlur = useCallback(() => {
      valueChangeHandler(valueParsed);
    }, [valueParsed, valueChangeHandler]);

    const onIncrementClick = useCallback(() => {
      valueChangeHandler(pipe(valueParsed).chainNullable((x) => x + 1).value);
    }, [valueParsed, valueChangeHandler]);

    const onDecrementClick = useCallback(() => {
      valueChangeHandler(pipe(valueParsed).chainNullable((x) => x - 1).value);
    }, [valueParsed, valueChangeHandler]);

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
