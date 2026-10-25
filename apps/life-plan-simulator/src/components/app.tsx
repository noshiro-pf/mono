import { If, view, type JSX } from 'synstate-dom';
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
