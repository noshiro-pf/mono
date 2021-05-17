import { memoNamed } from '@noshiro/react-utils';
import type { FC } from 'react';

export const App: FC = memoNamed('App', () => <div />);
