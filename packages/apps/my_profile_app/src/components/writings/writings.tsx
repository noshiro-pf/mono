import { memoNamed } from '@mono/react-utils';
import { writings } from '../../contents/writings';
import { WritingsView } from './writings-view';

export const Writings = memoNamed('Writings', () => (
  <WritingsView listElements={writings} />
));
