import * as React from 'react';
import {
  type ExhaustiveHandlers,
  useMapRouteMatch,
} from 'synstate-react-router';
import {
  Home,
  NotFound,
  ProductDetail,
  ProductList,
  Settings,
  UserDetail,
  UserList,
} from './pages/index.mjs';
import { router, routes } from './routes';

type Handlers = ExhaustiveHandlers<typeof routes, React.JSX.Element>;

export const App = React.memo(() => {
  const content = useMapRouteMatch(router.pathSegments, routes, {
    [routes.products.item.pattern]: ({ productId }) => (
      <ProductDetail productId={productId} />
    ),
    [routes.products.pattern]: () => <ProductList />,
    [routes.users.item.pattern]: ({ userId }) => <UserDetail userId={userId} />,
    [routes.users.pattern]: () => <UserList />,
    [routes.settings.pattern]: () => <Settings />,
    [routes.home.pattern]: () => <Home />,
    fallback: () => <NotFound />,
  } satisfies Handlers);

  return (
    <div style={rootStyle}>
      <h1>{'synstate-react-router example'}</h1>
      <p style={pathStyle}>
        {'Current path: '}
        <code>{globalThis.location.pathname}</code>
      </p>
      <hr />
      {content}
    </div>
  );
});

App.displayName = 'App';

const rootStyle = {
  fontFamily: 'system-ui, sans-serif',
  maxWidth: 600,
  margin: '0 auto',
  padding: 20,
} as const satisfies React.CSSProperties;

const pathStyle = {
  fontSize: 12,
  color: '#888',
} as const satisfies React.CSSProperties;
