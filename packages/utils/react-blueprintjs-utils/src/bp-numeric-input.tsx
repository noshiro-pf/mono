import { NumericInput } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import type { StrictOmit } from '@noshiro/ts-utils';
import { stringToNumber } from '@noshiro/ts-utils';
import type { ComponentProps, CSSProperties, FocusEventHandler } from 'react';
import { useCallback, useEffect, useState } from 'react';

type NumericInputPropsOriginal = ComponentProps<typeof NumericInput>;

export type BpNumericInputProps = Readonly<{
  value: number;
  onValueChangeFiltered?: (valueAsNumber: number) => void;
  parseNumericString?: (value: string) => number | undefined;
  valueWhenNotParsedAsNumber?: number;
  convertValueOnBlurAndEmit?: (
    valueAsNumber: number,
    valueAsString: string
  ) => number;
}> &
  StrictOmit<NumericInputPropsOriginal, 'value'>;

export const BpNumericInput = memoNamed<BpNumericInputProps>(
  'BpNumericInput',
  ({
    value,
    onValueChange,
    onValueChangeFiltered,
    selectAllOnFocus = true,
    fill = true,
    parseNumericString = stringToNumber,
    valueWhenNotParsedAsNumber = 0,
    onBlur,
    convertValueOnBlurAndEmit,
    ...props
  }) => {
    const [state, setState] = useState<string>(value.toString());

    useEffect(() => {
      setState(value.toString());
    }, [value]);

    const onValueChangeInternal = useCallback(
      (
        valueAsNumber: number,
        valueAsString: string,
        inputElement: HTMLInputElement | null
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
      [onValueChange, onValueChangeFiltered, parseNumericString]
    );

    const onBlurInternal = useCallback<FocusEventHandler<HTMLInputElement>>(
      (ev) => {
        if (onBlur !== undefined) {
          onBlur(ev);
        }

        if (onValueChangeFiltered === undefined) return;

        const parsed = parseNumericString(state);
        if (parsed === undefined) {
          if (convertValueOnBlurAndEmit !== undefined) {
            onValueChangeFiltered(
              convertValueOnBlurAndEmit(valueWhenNotParsedAsNumber, state)
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
      ]
    );

    return (
      <NumericInput
        value={state}
        onValueChange={onValueChangeInternal}
        onBlur={onBlurInternal}
        selectAllOnFocus={selectAllOnFocus}
        fill={fill}
        style={style}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
    );
  }
);

const style: CSSProperties = {
  textAlign: 'right',
};
