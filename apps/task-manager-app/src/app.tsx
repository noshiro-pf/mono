import { If, view, type JSX } from 'synstate-dom';
import {
  MainScreen,
  SignInScreen,
  StartingScreen,
} from './components/index.mjs';
import { sessionStore } from './store/index.mjs';

/**
 * A personal task manager whose core is the dependency graph between tasks
 * and milestones: what can be started now follows from what it waits for.
 *
 * Which screen is up follows the session alone, and each is built once per
 * change of screen; everything below binds the store's observables.
 */
export const App = (): JSX.Element => {
  const { session } = sessionStore;

  return (
    <If
      cond={view(session, (s) => s.type === 'starting')}
      then={<StartingScreen />}
      else={
        <If
          cond={view(session, (s) => s.type === 'signed-out')}
          then={
            <SignInScreen
              error={view(session, (s) =>
                s.type === 'signed-out' ? s.error : undefined,
              )}
              signingIn={view(
                session,
                (s) => s.type === 'signed-out' && s.signingIn,
              )}
            />
          }
          else={
            <MainScreen
              userName={view(session, (s) =>
                s.type === 'signed-in' ? s.userName : '',
              )}
            />
          }
        />
      }
    />
  );
};
