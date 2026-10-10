import { memoNamed } from 'preact-utils';
import { sessionStore } from '../store/index.mjs';

type Props = Readonly<{
  error: string | undefined;
  signingIn: boolean;
}>;

/** Shown while nobody is signed in: one button, Google sign-in in a popup. */
export const SignInScreen = memoNamed<Props>('SignInScreen', (props) => {
  const { error, signingIn } = props;

  return (
    <main className={'center-screen'}>
      <div className={'bp6-card bp6-elevation-1 sign-in-card'}>
        <h1 className={'bp6-heading'}>{'タスク管理'}</h1>
        <p>
          {
            'タスクとマイルストーンの依存関係から、いま着手できるものを示します。'
          }
        </p>
        <button
          className={'bp6-button bp6-intent-primary bp6-large'}
          data-e2e={'sign-in'}
          disabled={signingIn}
          type={'button'}
          onClick={sessionStore.signIn}
        >
          {signingIn ? 'サインイン中…' : 'Google でサインイン'}
        </button>
        {error === undefined ? undefined : (
          <p className={'bp6-callout bp6-intent-danger'} role={'alert'}>
            {error}
          </p>
        )}
      </div>
    </main>
  );
});
