import type { VNode } from 'preact';
import { memoNamed } from './memo-named';

type Props = Readonly<{
  children: readonly VNode[];
  index: number;
}>;

const displayNoneStyle = { display: 'none' };

export const ComponentSwitcher = memoNamed<Props>(
  'ComponentSwitcher',
  ({ children, index }) => (
    <>
      {
        // eslint-disable-next-line noshiro-custom/prefer-readonly-parameter-types
        children.map((c, i) =>
          i === index ? (
            <div key={i}>{c}</div>
          ) : (
            <div key={i} style={displayNoneStyle}>
              {c}
            </div>
          )
        )
      }
    </>
  )
);
