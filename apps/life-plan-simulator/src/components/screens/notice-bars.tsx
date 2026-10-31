import { Button, Callout } from 'blueprint-synstate';
import { constant, If, view, type JSX } from 'synstate-dom';
import { planStore, sessionStore } from '../../store/index.mjs';

/**
 * Asks what to do when a sign-out stopped because writes made offline could not
 * be sent: signing out deletes them with the rest of the data kept on this
 * device.
 */
export const UnsentWritesBar = (): JSX.Element => (
  <If
    cond={view(sessionStore.signOutState, (state) => state === 'unsent-writes')}
    then={
      <Callout
        class={'notice-bar'}
        intent={'warning'}
        data-e2e={constant('unsent-writes')}
        role={'alert'}
      >
        <span>
          {constant(
            'オフライン中の変更がまだ送信されていないため、サインアウトしませんでした。いまサインアウトすると、この変更は失われます。',
          )}
        </span>
        <span class={constant('actions')}>
          <Button
            intent={'danger'}
            text={constant('変更を破棄してサインアウト')}
            onClick={sessionStore.discardUnsentWritesAndSignOut}
          />
          <Button
            text={constant('サインアウトしない')}
            onClick={sessionStore.cancelSignOut}
          />
        </span>
      </Callout>
    }
  />
);

/** Says that a write was refused, until it is dismissed. */
export const WriteErrorBar = (): JSX.Element => (
  <If
    cond={view(planStore.writeError, (message) => message !== undefined)}
    then={
      <Callout class={'notice-bar'} intent={'danger'} role={'alert'}>
        <span>{view(planStore.writeError, (message) => message ?? '')}</span>
        <Button
          icon={'cross'}
          variant={constant('minimal')}
          text={constant('閉じる')}
          onClick={planStore.dismissWriteError}
        />
      </Callout>
    }
  />
);
