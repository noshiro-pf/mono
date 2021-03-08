import { memoNamed } from '@noshiro/react-utils';
import { ReactNodeArray } from 'react';

// 非表示componentも状態を維持するためdisplay: noneを利用

export const ComponentSwitcher = memoNamed<{
  children: ReactNodeArray;
  index: number;
}>('ComponentSwitcher', ({ children, index }) => (
  <>
    {children.map((c, i) =>
      i === index ? (
        <div key={i}>{c}</div>
      ) : (
        <div key={i} style={{ display: 'none' }}>
          {c}
        </div>
      )
    )}
  </>
));
