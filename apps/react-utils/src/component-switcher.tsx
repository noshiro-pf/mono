/** @jsxImportSource react */
// This file is also compiled by consumers that set `jsxImportSource` to
// Emotion; it uses no `css` prop, so it says which runtime it needs.
import { memoNamed } from './memo-named.mjs';

type Props = Readonly<{
  children: readonly React.ReactNode[];
  index: number;
}>;

const displayNoneStyle = { display: 'none' } as const;

export const ComponentSwitcher = memoNamed<Readonly<Props>>(
  'ComponentSwitcher',
  ({ children, index }) => (
    <>
      {children.map((c, i) =>
        i === index ? (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i}>{c}</div>
        ) : (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i} style={displayNoneStyle}>
            {c}
          </div>
        ),
      )}
    </>
  ),
);
