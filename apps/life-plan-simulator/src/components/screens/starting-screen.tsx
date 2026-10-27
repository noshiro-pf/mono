import { constant, type JSX } from 'synstate-dom';

/** Shown until the backend has said who, if anyone, is signed in. */
export const StartingScreen = (): JSX.Element => (
  <main aria-busy={constant('true')} class={constant('center-screen')}>
    <output class={constant('bp6-text-muted')}>
      {constant('読み込み中…')}
    </output>
  </main>
);
