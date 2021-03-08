import { memoNamed } from '@noshiro/react-utils';
import { FC } from 'react';
import { AppSub } from './App-sub';

export const App: FC = memoNamed('App', () => <AppSub />);
