import { ComponentType, FC, memo } from 'react';
import { Redirect, Route } from 'react-router';

type Props = Readonly<{
  loggedIn: boolean | undefined;
  path: string;
  component: ComponentType;
  exact: boolean;
  redirectTo: string;
}>;

export const PrivateRoute: FC<Props> = memo(
  ({ loggedIn, path, component, exact, redirectTo }: Props) => {
    switch (loggedIn) {
      case undefined:
        return <div />;
      case false:
        return <Redirect to={redirectTo} />;
      case true:
        return <Route exact={exact} path={path} component={component} />;
    }
  }
);

PrivateRoute.displayName = 'PrivateRoute';
