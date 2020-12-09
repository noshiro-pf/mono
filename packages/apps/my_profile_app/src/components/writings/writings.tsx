import { memoNamed } from '@mono/react-utils';
import React from 'react';
import { writings } from '../../contents/writings';
import { WritingsView } from './writings-view';

export const Writings = memoNamed('Writings', () => (
  <WritingsView listElements={writings} />
));
