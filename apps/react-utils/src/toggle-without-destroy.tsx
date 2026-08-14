/** @jsxImportSource react */
// This file is also compiled by consumers that set `jsxImportSource` to
// Emotion; it uses no `css` prop, so it says which runtime it needs.
import { memoNamed } from './memo-named.mjs';

// `Readonly`, not `DeepReadonly`: a deeply-readonly `ReactNode` is no longer a
// `ReactNode`, and React is the one consuming these.
type Props = Readonly<{
  condition: boolean;
  childTrue: React.ReactNode;
  childFalse: React.ReactNode;
  style?: Readonly<React.CSSProperties>;
}>;

const displayNoneStyle = { display: 'none' } as const;

export const ToggleWithoutDestroy = memoNamed<Props>(
  'ToggleWithoutDestroy',
  ({ condition, childTrue, childFalse, style }: Readonly<Props>) => (
    <>
      <div style={condition ? style : displayNoneStyle}>{childTrue}</div>
      <div style={condition ? displayNoneStyle : style}>{childFalse}</div>
    </>
  ),
);
