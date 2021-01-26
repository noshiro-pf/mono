import { VNode } from 'preact';
import { memoNamed } from './memo-named';

interface Props {
  children: readonly VNode[];
  index: number;
}

const displayNoneStyle = { display: 'none' };

export const ComponentSwitcher = memoNamed<Props>(
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
