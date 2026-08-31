import { memoNamed } from './memo-named.mjs';

type Props = Readonly<{
  children: readonly preact.ComponentChild[];
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
