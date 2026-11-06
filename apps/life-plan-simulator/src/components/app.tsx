import { map } from 'synstate';
import { If, type JSX } from 'synstate-dom';
import { sessionStore } from '../store/index.mjs';
import { MainScreen, SignInScreen, StartingScreen } from './screens/index.mjs';

/**
 * どの画面を出すかはセッションだけで決まる。サインインするとプランの一覧が
 * 読み込まれ、選んだプランをタブで編集する。
 */
export const App = (): JSX.Element => {
  const { session } = sessionStore;

  return (
    <If
      cond={session.pipe(map((s) => s.type === 'starting'))}
      then={<StartingScreen />}
      else={
        <If
          cond={session.pipe(map((s) => s.type === 'signed-out'))}
          then={
            <SignInScreen
              error={session.pipe(
                map((s) => (s.type === 'signed-out' ? s.error : undefined)),
              )}
              signingIn={session.pipe(
                map((s) => s.type === 'signed-out' && s.signingIn),
              )}
            />
          }
          else={
            <MainScreen
              userName={session.pipe(
                map((s) => (s.type === 'signed-in' ? s.userName : '')),
              )}
            />
          }
        />
      }
    />
  );
};
