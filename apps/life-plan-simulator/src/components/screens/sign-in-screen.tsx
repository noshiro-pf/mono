import {
  constant,
  If,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { sessionStore } from '../../store/index.mjs';

type Props = Readonly<{
  error: Bindable<string | undefined>;
  signingIn: Bindable<boolean>;
}>;

/** Shown while nobody is signed in: one button, Google sign-in in a popup. */
export const SignInScreen = ({ error, signingIn }: Props): JSX.Element => (
  <main class={constant('center-screen')}>
    <section class={constant('sign-in-card')}>
      <h1>{constant('ライフプランシミュレーター')}</h1>
      <p>
        {constant(
          '収入・支出・資産の推移を月ごとに計算します。プランはアカウントに保存され、複数作って比べられます。',
        )}
      </p>
      <button
        class={constant('primary')}
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
          <p class={constant('error')} role={constant('alert')}>
            {mapBindable(error, (message) => message ?? '')}
          </p>
        }
      />
    </section>
  </main>
);
