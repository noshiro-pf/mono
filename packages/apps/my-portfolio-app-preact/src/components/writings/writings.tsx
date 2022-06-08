import { memoNamed } from '@noshiro/preact-utils';
import { writings } from '../../assets';
import { WritingsElement } from './writings-element';

export const Writings = memoNamed('Writings', () => (
  <div>
    <h1>{'執筆物'}</h1>
    <p>{'★は特に時間をかけたものを表しています。'}</p>
    {writings.map((el) => (
      <WritingsElement
        key={el.id}
        body={el.body}
        link={el.link}
        subtitle={el.subtitle}
        title={el.title}
      />
    ))}
  </div>
));
