import { NumericInput } from '@blueprintjs/core';
import { memoNamed, useState } from '@noshiro/react-utils';
import { Num } from '@noshiro/ts-utils';
import { useCallback, useEffect } from 'react';

export type BpNumericInputProps = Omit<NumericInputPropsOriginal, 'value'> &
  Readonly<{
    value: number;
    onValueChangeFiltered?: (valueAsNumber: number) => void;
    parseNumericString?: (value: string) => number | undefined;
    valueWhenNotParsedAsNumber?: number;
    convertValueOnBlurAndEmit?: (
      valueAsNumber: number,
      valueAsString: string,
    ) => number;
  }>;

type NumericInputPropsOriginal = React.ComponentProps<typeof NumericInput>;

export const BpNumericInput = memoNamed<BpNumericInputProps>(
  'BpNumericInput',
  ({
    value,
    onValueChange,
    onValueChangeFiltered,
    selectAllOnFocus = true,
    fill = true,
    parseNumericString = Num.from,
    valueWhenNotParsedAsNumber = 0,
    onBlur,
    convertValueOnBlurAndEmit,
    ...props
  }) => {
    const { state, setState } = useState<string>(value.toString());

    useEffect(() => {
      setState(value.toString());
    }, [value, setState]);

    const onValueChangeInternal = useCallback(
      (
        valueAsNumber: number,
        valueAsString: string,
        inputElement: HTMLInputElement | null,
      ) => {
        if (onValueChange !== undefined) {
          onValueChange(valueAsNumber, valueAsString, inputElement);
        }
        setState(valueAsString);

        const parsed = parseNumericString(valueAsString);
        if (parsed !== undefined && onValueChangeFiltered !== undefined) {
          onValueChangeFiltered(parsed);
        }
      },
      [onValueChange, onValueChangeFiltered, parseNumericString, setState],
    );

    const onBlurInternal = useCallback<
      React.FocusEventHandler<HTMLInputElement>
    >(
      (ev) => {
        if (onBlur !== undefined) {
          onBlur(ev);
        }

        if (onValueChangeFiltered === undefined) return;

        const parsed = parseNumericString(state);
        if (parsed === undefined) {
          if (convertValueOnBlurAndEmit !== undefined) {
            onValueChangeFiltered(
              convertValueOnBlurAndEmit(valueWhenNotParsedAsNumber, state),
            );
          } else {
            onValueChangeFiltered(valueWhenNotParsedAsNumber);
          }
        } else {
          if (convertValueOnBlurAndEmit !== undefined) {
            onValueChangeFiltered(convertValueOnBlurAndEmit(parsed, state));
          }
        }
      },
      [
        state,
        parseNumericString,
        valueWhenNotParsedAsNumber,
        onValueChangeFiltered,
        onBlur,
        convertValueOnBlurAndEmit,
      ],
    );

    return (
      <NumericInput
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        fill={fill}
        selectAllOnFocus={selectAllOnFocus}
        style={style}
        value={state}
        onBlur={onBlurInternal}
        onValueChange={onValueChangeInternal}
      />
    );
  },
);

const style: React.CSSProperties = {
  textAlign: 'right',
};
