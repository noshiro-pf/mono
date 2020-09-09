import { INumericInputProps, NumericInput } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React, { CSSProperties } from 'react';

const style: CSSProperties = {
  textAlign: 'right',
};

interface Props extends INumericInputProps {
  value: number;
  onValueChange: (value: number) => void;
}

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
