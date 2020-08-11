import React, { FC } from 'react';
import Media from 'react-media';
import { BrowserRouter } from 'react-router-dom';
import { AppSub } from './App-view';

const query = { maxWidth: 800 };

export const App: FC = () => (
  <BrowserRouter>
    <Media query={query}>{(matches) => <AppSub mobile={matches} />}</Media>
  </BrowserRouter>
);
