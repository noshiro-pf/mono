import { IconName, Intent } from '@blueprintjs/core';
import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed, useAlive, useBooleanState } from '@noshiro/react-utils';
import { useCallback } from 'react';
import { createToaster, showToast } from '../../../utils/toaster';
import { ConfirmDialog } from './confirm-dialog';

type Props = Readonly<{
  onConfirmClick: (() => void) | (() => Promise<void>);
  disabled?: boolean;
  loading?: boolean;
  buttonConfig: Readonly<{
    name: string;
    intent?: Intent;
    icon?: IconName;
  }>;
  dialogConfig: Readonly<{
    icon?: IconName;
    intent?: Intent;
    message: string;
    cancelButtonText: string;
    confirmButtonText: string;
  }>;
  toastConfig: Readonly<{ message: string; intent: Intent }>;
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
    const [isOpen, open, close] = useBooleanState(false);

    const alive = useAlive();
    const onConfirm = useCallback(() => {
      if (!alive) return;
      const afterConfirm = (): void => {
        showToast({
          toast,
          message: toastConfig.message,
          intent: toastConfig.intent,
        });
        close();
      };

      const p = onConfirmClick();
      if (p instanceof Promise) {
        if (!alive) return;
        p.then(afterConfirm).catch(console.error);
      } else {
        afterConfirm();
      }
    }, [alive, onConfirmClick, close, toastConfig]);

    return (
      <>
        <BpButton
          text={buttonConfig.name}
          intent={buttonConfig.intent ?? 'none'}
          icon={buttonConfig.icon}
          onClick={open}
          disabled={disabled}
          loading={loading}
          nowrap={true}
        />
        <ConfirmDialog
          isOpen={isOpen}
          onCancel={close}
          onConfirm={onConfirm}
          cancelButtonText={dialogConfig.cancelButtonText}
          confirmButtonText={dialogConfig.confirmButtonText}
          message={dialogConfig.message}
          icon={dialogConfig.icon}
          intent={dialogConfig.intent ?? 'none'}
        />
      </>
    );
  }
);
