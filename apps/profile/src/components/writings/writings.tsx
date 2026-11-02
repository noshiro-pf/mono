import { constant, type JSX } from 'synstate-dom';
import { writings } from '../../assets/index.mjs';
import { WritingsElement } from './writings-element.js';

export const Writings = (): JSX.Element => (
  <div>
    <h1>{constant('執筆物')}</h1>
    {writings.map((writing) => (
      <WritingsElement writing={writing} />
    ))}
  </div>
);
