import { useBoolState } from 'better-react-use-state';
import * as React from 'react';
import { ButtonNowrapStyled } from 'react-blueprintjs-utils';
import { memoNamed, useAlive } from 'react-utils';
import { hasKey, isRecord } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';
import { createToaster, showToast } from '../../../functions/index.mjs';
import { ConfirmDialog } from './confirm-dialog.js';

type Props = DeepReadonly<{
  onConfirmClick: (() => Promise<void>) | (() => void);
  disabled?: boolean;
  loading?: boolean;
  buttonConfig: {
    name: string | undefined;
    intent?: Intent;
    icon?: IconName;
    color?: string;
    minimal?: boolean;
  };
  dialogConfig: {
    icon?: IconName;
    intent?: Intent;
    message: string;
    description?: string;
    cancelButtonText: string;
    confirmButtonText: string;
  };
  toastConfig?: { message: string; intent: Intent };
}>;

const toast = createToaster();

export const ButtonWithConfirm = memoNamed<Props>(
  'ButtonWithConfirm',
  ({
    onConfirmClick,
    disabled,
    loading,
    buttonConfig,
    dialogConfig,
    toastConfig,
  }) => {
    const [isOpen, { setTrue: handleOpen, setFalse: handleClose }] =
      useBoolState(false);

    const [
      loadingLocal,
      { setTrue: setTrueLoadingLocal, setFalse: setFalseLoadingLocal },
    ] = useBoolState(false);

    const alive = useAlive();

    const onConfirm = React.useCallback(() => {
      if (!alive.current) return;

      const afterConfirm = (): void => {
        if (toastConfig !== undefined) {
          showToast({
            toast,
            message: toastConfig.message,
            intent: toastConfig.intent,
          });
        }

        handleClose();
      };

      // `unknown`, not the declared `Promise<void> | void`: a `() => void`
      // may return anything at runtime — TypeScript's `void` accepts any
      // value — so `p !== undefined` would send a non-thenable down the
      // `.then` branch. The pre-restoration code asked `p instanceof
      // Promise`; asking whether it is thenable says the same thing without
      // `unicorn/no-instanceof-builtins`, and also covers a promise from
      // another realm.
      const p: unknown = onConfirmClick();

      if (isPromiseLike(p)) {
        setTrueLoadingLocal();

        Promise.resolve(p)
          .then(() => {
            if (!alive.current) return;

            afterConfirm();

            setFalseLoadingLocal();
          })
          .catch(console.error);
      } else {
        afterConfirm();
      }
    }, [
      onConfirmClick,
      handleClose,
      toastConfig,
      alive,
      setTrueLoadingLocal,
      setFalseLoadingLocal,
    ]);

    return (
      <>
        <ButtonNowrapStyled
          color={buttonConfig.color}
          data-e2e={'button-with-confirmation'}
          disabled={disabled}
          icon={buttonConfig.icon}
          intent={buttonConfig.intent ?? 'none'}
          loading={loading ?? loadingLocal}
          text={buttonConfig.name}
          variant={buttonConfig.minimal === true ? 'minimal' : 'solid'}
          onClick={handleOpen}
        />
        <ConfirmDialog
          cancelButtonText={dialogConfig.cancelButtonText}
          confirmButtonText={dialogConfig.confirmButtonText}
          description={dialogConfig.description}
          icon={dialogConfig.icon}
          intent={dialogConfig.intent ?? 'none'}
          isOpen={isOpen}
          loading={loading ?? loadingLocal}
          message={dialogConfig.message}
          onCancel={handleClose}
          onConfirm={onConfirm}
        />
      </>
    );
  },
);

const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
  isRecord(value) && hasKey(value, 'then') && typeof value.then === 'function';
