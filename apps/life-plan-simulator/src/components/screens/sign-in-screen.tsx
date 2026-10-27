import { Button, Callout, Card } from 'blueprint-synstate';
import {
  constant,
  If,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { sessionStore } from '../../store/index.mjs';
import { ThemeControl } from './theme-control.js';

type Props = Readonly<{
  error: Bindable<string | undefined>;
  signingIn: Bindable<boolean>;
}>;

/** Shown while nobody is signed in: one button, Google sign-in in a popup. */
export const SignInScreen = ({ error, signingIn }: Props): JSX.Element => (
  <main class={constant('center-screen')}>
    <Card class={'sign-in-card'} elevation={1}>
      <h1 class={constant('bp6-heading')}>
        {constant('ライフプランシミュレーター')}
      </h1>
      <p>
        {constant(
          '収入・支出・資産の推移を月ごとに計算します。プランはアカウントに保存され、複数作って比べられます。',
        )}
      </p>
      <Button
        intent={'primary'}
        size={'large'}
        data-e2e={constant('sign-in')}
        disabled={signingIn}
        text={mapBindable(signingIn, (busy) =>
          busy ? 'サインイン中…' : 'Google でサインイン',
        )}
        onClick={sessionStore.signIn}
      />
      <If
        cond={mapBindable(error, (message) => message !== undefined)}
        then={
          <Callout intent={'danger'} role={'alert'}>
            {mapBindable(error, (message) => message ?? '')}
          </Callout>
        }
      />
      <ThemeControl />
    </Card>
  </main>
);
