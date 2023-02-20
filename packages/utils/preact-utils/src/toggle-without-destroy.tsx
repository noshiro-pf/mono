import { memoNamed } from './memo-named';

type Props = Readonly<{
  condition: boolean;
  childTrue: preact.VNode;
  childFalse: preact.VNode;
  style?: preact.JSX.CSSProperties;
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
