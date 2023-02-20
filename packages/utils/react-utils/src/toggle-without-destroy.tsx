import { memoNamed } from './memo-named';

type Props = DeepReadonly<{
  condition: boolean;
  childTrue: React.ReactNode;
  childFalse: React.ReactNode;
  style?: React.CSSProperties;
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
