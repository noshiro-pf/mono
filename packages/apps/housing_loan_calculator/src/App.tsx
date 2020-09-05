import { memoNamed } from '@mono/react-utils';
import React, { FC } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { AppSub } from './App-sub';

export const App: FC = memoNamed('App', () => (
  <BrowserRouter>
    <Switch>
      <Route path={'*'} component={AppSub} />
    </Switch>
  </BrowserRouter>
));
