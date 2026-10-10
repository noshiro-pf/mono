import { memoNamed } from 'preact-utils';
import {
  MainScreen,
  SignInScreen,
  StartingScreen,
} from './components/index.mjs';
import { sessionSignal } from './store/index.mjs';

/**
 * A personal task manager whose core is the dependency graph between tasks
 * and milestones: what can be started now follows from what it waits for.
 *
 * Which screen is up follows the session alone; everything below reads the
 * store through its signals.
 */
export const App = memoNamed('App', () => {
  const session = sessionSignal.value;

  return session.type === 'starting' ? (
    <StartingScreen />
  ) : session.type === 'signed-out' ? (
    <SignInScreen error={session.error} signingIn={session.signingIn} />
  ) : (
    <MainScreen userName={session.userName} />
  );
});
