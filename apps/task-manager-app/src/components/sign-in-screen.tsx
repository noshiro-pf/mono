import {
  constant,
  If,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { sessionStore } from '../store/index.mjs';

type Props = Readonly<{
  error: Bindable<string | undefined>;
  signingIn: Bindable<boolean>;
}>;

/** Shown while nobody is signed in: one button, Google sign-in in a popup. */
export const SignInScreen = ({ error, signingIn }: Props): JSX.Element => (
  <main class={constant('center-screen')}>
    <div class={constant('bp6-card bp6-elevation-1 sign-in-card')}>
      <h1 class={constant('bp6-heading')}>{constant('タスク管理')}</h1>
      <p>
        {constant(
          'タスクとマイルストーンの依存関係から、いま着手できるものを示します。',
        )}
      </p>
      <button
        class={constant('bp6-button bp6-intent-primary bp6-large')}
        data-e2e={constant('sign-in')}
        disabled={signingIn}
        type={constant('button')}
        onClick={sessionStore.signIn}
      >
        {mapBindable(signingIn, (busy) =>
          busy ? 'サインイン中…' : 'Google でサインイン',
        )}
      </button>
      <If
        cond={mapBindable(error, (message) => message !== undefined)}
        then={
          <p
            class={constant('bp6-callout bp6-intent-danger')}
            role={constant('alert')}
          >
            {mapBindable(error, (message) => message ?? '')}
          </p>
        }
      />
    </div>
  </main>
);
