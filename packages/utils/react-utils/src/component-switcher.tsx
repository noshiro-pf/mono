import type { ReactNodeArray } from 'react';
import { memoNamed } from './memo-named';

type Props = Readonly<{
  children: ReactNodeArray;
  index: number;
}>;

const displayNoneStyle = { display: 'none' };

export const ComponentSwitcher = memoNamed<Readonly<Props>>(
  'ComponentSwitcher',
  ({ children, index }) => (
    <>
      {children.map((c, i) =>
        i === index ? (
          <div key={i}>{c}</div>
        ) : (
          <div key={i} style={displayNoneStyle}>
            {c}
          </div>
        )
      )}
    </>
  )
);
