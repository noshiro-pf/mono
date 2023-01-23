import { type h, type VNode } from 'preact';
import { memoNamed } from './memo-named';

type Props = Readonly<{
  condition: boolean;
  childTrue: VNode;
  childFalse: VNode;
  style?: h.JSX.CSSProperties;
}>;

const displayNoneStyle = { display: 'none' };

export const ToggleWithoutDestroy = memoNamed<Props>(
  'ToggleWithoutDestroy',
  ({ condition, childTrue, childFalse, style }) => (
    <>
      <div style={condition ? style : displayNoneStyle}>{childTrue}</div>
      <div style={condition ? displayNoneStyle : style}>{childFalse}</div>
    </>
  )
);
