import { memoNamed } from '@noshiro/react-utils';
import { writings } from '../../assets';
import { WritingsElement } from './writings-element';

export const Writings = memoNamed('Writings', () => (
  <div>
    <h1>{'執筆物'}</h1>
    {writings.map((el) => (
      <WritingsElement
        key={el.id}
        body1={el.body1}
        link={el.link}
        subtitle={el.subtitle}
        title={el.title}
      />
    ))}
  </div>
));
