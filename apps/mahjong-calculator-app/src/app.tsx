import { constant, type JSX } from 'synstate-dom';
import * as styles from './app.module.css';
import { Calculator } from './components/index.mjs';

export const App = (): JSX.Element => (
  <div class={constant(styles.root)} data-e2e={constant('root')}>
    <Calculator />
  </div>
);
