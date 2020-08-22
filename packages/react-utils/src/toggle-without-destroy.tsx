import React, { CSSProperties, ReactNode } from 'react';
import { memoNamed } from './memo-named';

type Props = Readonly<{
  condition: boolean;
  childTrue: ReactNode;
  childFalse: ReactNode;
  style?: CSSProperties;
}>;

const displayNoneStyle = { display: 'none' };

export const ToggleWithoutDestroy = memoNamed<Props>(
  'ToggleWithoutDestroy',
  ({ condition, childTrue, childFalse, style }: Props) => (
    <>
      <div style={condition ? style : displayNoneStyle}>{childTrue}</div>
      <div style={condition ? displayNoneStyle : style}>{childFalse}</div>
    </>
  )
);
