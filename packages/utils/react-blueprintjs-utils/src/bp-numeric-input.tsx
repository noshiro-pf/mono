import type { NumericInputProps } from '@blueprintjs/core';
import { NumericInput } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import type { CSSProperties } from 'react';

type Props = NumericInputProps &
  Readonly<{
    value: number;
    onValueChange: (value: number) => void;
  }>;

export const BpNumericInput = memoNamed<Props>(
  'BpNumericInput',
  ({
    value,
    onValueChange,
    allowNumericCharactersOnly = true,
    clampValueOnBlur = true,
    selectAllOnFocus = true,
    fill = true,
    ...props
  }) => (
    <NumericInput
      style={style}
      value={value}
      onValueChange={onValueChange}
      allowNumericCharactersOnly={allowNumericCharactersOnly}
      clampValueOnBlur={clampValueOnBlur}
      selectAllOnFocus={selectAllOnFocus}
      fill={fill}
      {...props}
    />
  )
);

const style: CSSProperties = {
  textAlign: 'right',
};
