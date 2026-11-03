import { Button, type IconName, type IconName20 } from 'blueprint-synstate';
import { createState, onScopeDispose } from 'synstate';
import { constant, type Bindable, type JSX } from 'synstate-dom';
import { hasKey, isRecord } from 'ts-data-forge';
import { createToaster, showToast } from '../../../functions/index.mjs';
import { nowrapClass } from '../../styled/index.mjs';
import { ConfirmDialog } from './confirm-dialog.js';

type Props = Readonly<{
  onConfirmClick: (() => Promise<void>) | (() => void);
  disabled?: Bindable<boolean>;
  loading?: Bindable<boolean>;
  buttonConfig: Readonly<{
    name: string | undefined;
    intent?: Intent;
    icon?: IconName;
    minimal?: boolean;
  }>;
  dialogConfig: Readonly<{
    icon?: IconName20;
    intent?: Intent;
    message: string;
    description?: string;
    cancelButtonText: string;
    confirmButtonText: string;
  }>;
  toastConfig?: Readonly<{ message: string; intent: Intent }>;
}>;

const toast = createToaster();

/** A button that asks in an alert before it does what it says. */
export const ButtonWithConfirm = ({
  onConfirmClick,
  disabled,
  loading,
  buttonConfig,
  dialogConfig,
  toastConfig,
}: Props): JSX.Element => {
  const [isOpen$, setIsOpen] = createState(false);

  const [loadingLocal$, setLoadingLocal] = createState(false);

  const loading$ = loading ?? loadingLocal$;

  let mut_alive = true;

  onScopeDispose(() => {
    mut_alive = false;
  });

  const afterConfirm = (): void => {
    if (toastConfig !== undefined) {
      showToast({
        toast,
        message: toastConfig.message,
        intent: toastConfig.intent,
      });
    }

    setIsOpen(false);
  };

  const onConfirm = (): void => {
    // `unknown`, not the declared `Promise<void> | void`: a `() => void` may
    // return anything at runtime — TypeScript's `void` accepts any value — so
    // `p !== undefined` would send a non-thenable down the `.then` branch.
    const p: unknown = onConfirmClick();

    if (isPromiseLike(p)) {
      setLoadingLocal(true);

      Promise.resolve(p)
        .then(() => {
          if (!mut_alive) {
            return;
          }

          afterConfirm();

          setLoadingLocal(false);
        })
        .catch(console.error);
    } else {
      afterConfirm();
    }
  };

  return (
    <>
      <Button
        class={nowrapClass}
        data-e2e={constant('button-with-confirmation')}
        disabled={disabled}
        icon={buttonConfig.icon}
        intent={buttonConfig.intent ?? 'none'}
        loading={loading$}
        {...(buttonConfig.name === undefined
          ? {}
          : { text: constant(buttonConfig.name) })}
        variant={constant(buttonConfig.minimal === true ? 'minimal' : 'solid')}
        onClick={() => {
          setIsOpen(true);
        }}
      />
      <ConfirmDialog
        cancelButtonText={dialogConfig.cancelButtonText}
        confirmButtonText={dialogConfig.confirmButtonText}
        description={dialogConfig.description}
        icon={dialogConfig.icon}
        intent={dialogConfig.intent ?? 'none'}
        isOpen={isOpen$}
        loading={loading$}
        message={dialogConfig.message}
        onCancel={() => {
          setIsOpen(false);
        }}
        onConfirm={onConfirm}
      />
    </>
  );
};

const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
  isRecord(value) && hasKey(value, 'then') && typeof value.then === 'function';
