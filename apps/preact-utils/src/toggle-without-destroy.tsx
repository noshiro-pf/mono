import { type CSSProperties } from 'preact';
import { memoNamed } from './memo-named.mjs';

type Props = Readonly<{
  condition: boolean;
  childTrue: preact.ComponentChild;
  childFalse: preact.ComponentChild;
  style?: CSSProperties;
}>;

const displayNoneStyle = { display: 'none' } as const;

export const ToggleWithoutDestroy = memoNamed<Readonly<Props>>(
  'ToggleWithoutDestroy',
  ({ condition, childTrue, childFalse, style }) => (
    <>
      <div style={condition ? style : displayNoneStyle}>{childTrue}</div>
      <div style={condition ? displayNoneStyle : style}>{childFalse}</div>
    </>
  ),
);
