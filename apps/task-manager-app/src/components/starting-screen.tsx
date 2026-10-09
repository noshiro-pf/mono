import { memoNamed } from 'preact-utils';

/** Shown until the backend has said who, if anyone, is signed in. */
export const StartingScreen = memoNamed('StartingScreen', () => (
  <div aria-busy className={'center-screen'}>
    <output className={'bp6-text-muted'}>{'読み込み中…'}</output>
  </div>
));
