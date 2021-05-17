import { memoNamed } from '@noshiro/react-utils';
import type { Mappable } from '@noshiro/ts-utils';
import type { WritingsInfo } from '../../types';
import { WritingsElement } from './writings-element';

export const WritingsView = memoNamed<{
  listElements: Mappable<WritingsInfo>;
}>('WritingsView', ({ listElements }) => (
  <div>
    <h1>執筆物</h1>
    {listElements.map((app, i) => (
      <WritingsElement
        key={i}
        link={app.link}
        title={app.title}
        subtitle={app.subtitle}
        body1={app.body1}
      />
    ))}
  </div>
));
