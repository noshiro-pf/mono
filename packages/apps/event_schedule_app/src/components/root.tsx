import { FC } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { redirects, routingList } from '../routing/routing';
import { NotFoundPage } from './pages/not-found-page';

export const Root: FC = () => (
  <BrowserRouter>
    <Switch>
      {redirects.map(([from, to]) => (
        <Route key={from} exact={true} path={from}>
          <Redirect to={to} />
        </Route>
      ))}
      {routingList.map(([path, component]) => (
        <Route key={path} exact={true} path={path} component={component} />
      ))}
      <Route path='*' component={NotFoundPage} />
    </Switch>
  </BrowserRouter>
);
