import { ApolloProvider } from '@apollo/react-hooks';
import React, { FC } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { client } from '../api/faunadb-client';
import { routing } from '../routing/routing';
import { NotFoundPage } from './pages/not-found-page';

export const Root: FC<Record<string, void>> = () => (
  <ApolloProvider client={client}>
    <BrowserRouter>
      <Switch>
        {routing.map(([path, component]) => (
          <Route key={path} exact={true} path={path} component={component} />
        ))}
        <Route path='*' component={NotFoundPage} />
      </Switch>
    </BrowserRouter>
  </ApolloProvider>
);
