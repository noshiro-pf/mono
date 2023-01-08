import { memoNamed } from '@noshiro/react-utils';
import type { ComponentType } from 'react';
import { Redirect, Route } from 'react-router';

type Props = Readonly<{
  loggedIn: boolean | undefined;
  path: string;
  component: ComponentType;
  exact: boolean;
  redirectTo: string;
}>;

export const PrivateRoute = memoNamed<Props>(
  'PrivateRoute',
  ({ loggedIn, path, component, exact, redirectTo }) => {
    switch (loggedIn) {
      case undefined:
        return <div />;
      case false:
        return <Redirect to={redirectTo} />;
      case true:
        return <Route component={component} exact={exact} path={path} />;
    }
  }
);
