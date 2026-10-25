import { constant, If, view, type JSX } from 'synstate-dom';
import { planStore, sessionStore } from '../../store/index.mjs';

/**
 * Asks what to do when a sign-out stopped because writes made offline could
 * not be sent: signing out deletes them with the rest of the data kept on
 * this device.
 */
export const UnsentWritesBar = (): JSX.Element => (
  <If
    cond={view(sessionStore.signOutState, (state) => state === 'unsent-writes')}
    then={
      <div
        class={constant('notice-bar warning')}
        data-e2e={constant('unsent-writes')}
        role={constant('alert')}
      >
        <span>
          {constant(
            'オフライン中の変更がまだ送信されていないため、サインアウトしませんでした。いまサインアウトすると、この変更は失われます。',
          )}
        </span>
        <span class={constant('actions')}>
          <button
            type={constant('button')}
            onClick={sessionStore.discardUnsentWritesAndSignOut}
          >
            {constant('変更を破棄してサインアウト')}
          </button>
          <button
            type={constant('button')}
            onClick={sessionStore.cancelSignOut}
          >
            {constant('サインアウトしない')}
          </button>
        </span>
      </div>
    }
  />
);

/** Says that a write was refused, until it is dismissed. */
export const WriteErrorBar = (): JSX.Element => (
  <If
    cond={view(planStore.writeError, (message) => message !== undefined)}
    then={
      <div class={constant('notice-bar error')} role={constant('alert')}>
        <span>{view(planStore.writeError, (message) => message ?? '')}</span>
        <button type={constant('button')} onClick={planStore.dismissWriteError}>
          {constant('閉じる')}
        </button>
      </div>
    }
  />
);
