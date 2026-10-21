import { createBooleanState } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';

const [isLoggedIn$] = createBooleanState(false);

const Dashboard = (): JSX.Element => <main>{constant('Dashboard')}</main>;

const Login = (): JSX.Element => <main>{constant('Please log in')}</main>;

// Both branches are descriptions: only the chosen one is mounted, and
// `Dashboard` is not called at all until `isLoggedIn$` becomes true.
export const App = (): JSX.Element => (
  <If cond={isLoggedIn$} then={<Dashboard />} else={<Login />} />
);
