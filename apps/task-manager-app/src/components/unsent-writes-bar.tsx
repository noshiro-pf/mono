import { memoNamed } from 'preact-utils';
import { sessionStore, signOutStateSignal } from '../store/index.mjs';

/**
 * Asks what to do when a sign-out stopped because writes made offline could
 * not be sent: signing out deletes them with the rest of the data kept on
 * this device.
 */
export const UnsentWritesBar = memoNamed('UnsentWritesBar', () =>
  signOutStateSignal.value === 'unsent-writes' ? (
    <div
      className={'bp6-callout bp6-intent-warning notice-bar'}
      data-e2e={'unsent-writes'}
      role={'alert'}
    >
      <span>
        {
          'オフライン中の変更がまだ送信されていないため、サインアウトしませんでした。いまサインアウトすると、この変更は失われます。'
        }
      </span>
      <span className={'unsent-writes-actions'}>
        <button
          className={'bp6-button bp6-intent-danger'}
          type={'button'}
          onClick={sessionStore.discardUnsentWritesAndSignOut}
        >
          {'変更を破棄してサインアウト'}
        </button>
        <button
          className={'bp6-button bp6-minimal'}
          type={'button'}
          onClick={sessionStore.cancelSignOut}
        >
          {'サインアウトしない'}
        </button>
      </span>
    </div>
  ) : undefined,
);
