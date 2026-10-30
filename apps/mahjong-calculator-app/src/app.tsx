import { constant, type JSX } from 'synstate-dom';
import { Calculator } from './components/index.mjs';

export const App = (): JSX.Element => (
  <div class={constant('app-root')} data-e2e={constant('root')}>
    <Calculator />
  </div>
);
