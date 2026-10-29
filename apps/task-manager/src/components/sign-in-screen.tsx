import {
  constant,
  If,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { m } from '../i18n/index.mjs';
import { sessionStore } from '../store/index.mjs';
import { LanguageField } from './language-field.js';

type Props = Readonly<{
  error: Bindable<string | undefined>;
  signingIn: Bindable<boolean>;
}>;

/** Shown while nobody is signed in: one button, Google sign-in in a popup. */
export const SignInScreen = ({ error, signingIn }: Props): JSX.Element => (
  <main class={constant('center-screen')}>
    <div class={constant('bp6-card bp6-elevation-1 sign-in-card')}>
      <h1 class={constant('bp6-heading')}>{constant(m.app.title)}</h1>
      <p>{constant(m.signIn.lead)}</p>
      <button
        class={constant('bp6-button bp6-intent-primary bp6-large')}
        data-e2e={constant('sign-in')}
        disabled={signingIn}
        type={constant('button')}
        onClick={sessionStore.signIn}
      >
        {mapBindable(signingIn, (busy) =>
          busy ? m.signIn.signingIn : m.signIn.signIn,
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
      <LanguageField />
    </div>
  </main>
);
