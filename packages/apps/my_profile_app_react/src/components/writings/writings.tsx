import { memoNamed } from '@noshiro/react-utils';
import { writings } from '../../assets';
import { WritingsView } from './writings-view';

export const Writings = memoNamed('Writings', () => (
  <WritingsView listElements={writings} />
));
