import { memoNamed } from '@mono/react-utils';
import React, { FC } from 'react';
import { AppSub } from './App-sub';

export const App: FC = memoNamed('App', () => <AppSub />);
