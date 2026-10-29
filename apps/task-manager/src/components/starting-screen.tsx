import { constant, type JSX } from 'synstate-dom';
import { m } from '../i18n/index.mjs';

/** Shown until the backend has said who, if anyone, is signed in. */
export const StartingScreen = (): JSX.Element => (
  <div aria-busy={constant('true')} class={constant('center-screen')}>
    <output class={constant('bp6-text-muted')}>
      {constant(m.app.loading)}
    </output>
  </div>
);
