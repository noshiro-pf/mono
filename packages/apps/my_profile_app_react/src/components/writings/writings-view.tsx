import { memoNamed } from '@noshiro/react-utils';
import type { DeepReadonly } from '@noshiro/ts-utils';
import type { WritingsInfo } from '../../types';
import { WritingsElement } from './writings-element';

export const WritingsView = memoNamed<
  DeepReadonly<{ listElements: WritingsInfo[] }>
>('WritingsView', ({ listElements }) => (
  <div>
    <h1>{'執筆物'}</h1>
    {listElements.map((app, i) => (
      <WritingsElement
        key={i}
        body1={app.body1}
        link={app.link}
        subtitle={app.subtitle}
        title={app.title}
      />
    ))}
  </div>
));
