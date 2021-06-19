import type { IconName, Intent } from '@blueprintjs/core';
import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed, useAlive, useBooleanState } from '@noshiro/react-utils';
import type { DeepReadonly } from '@noshiro/ts-utils';
import { useCallback } from 'react';
import { createToaster, showToast } from '../../../functions';
import { ConfirmDialog } from './confirm-dialog';

type Props = DeepReadonly<{
  onConfirmClick: (() => Promise<void>) | (() => void);
  disabled?: boolean;
  loading?: boolean;
  buttonConfig: {
    name: string;
    intent?: Intent;
    icon?: IconName;
  };
  dialogConfig: {
    icon?: IconName;
    intent?: Intent;
    message: string;
    cancelButtonText: string;
    confirmButtonText: string;
  };
  toastConfig: { message: string; intent: Intent };
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
    const [isOpen, handleOpen, handleClose] = useBooleanState(false);

    const alive = useAlive();
    const onConfirm = useCallback(() => {
      if (!alive) return;
      const afterConfirm = (): void => {
        showToast({
          toast,
          message: toastConfig.message,
          intent: toastConfig.intent,
        });
        handleClose();
      };

      const p = onConfirmClick();
      if (p instanceof Promise) {
        if (!alive) return;
        p.then(afterConfirm).catch(console.error);
      } else {
        afterConfirm();
      }
    }, [alive, onConfirmClick, handleClose, toastConfig]);

    return (
      <>
        <BpButton
          text={buttonConfig.name}
          intent={buttonConfig.intent ?? 'none'}
          icon={buttonConfig.icon}
          onClick={handleOpen}
          disabled={disabled}
          loading={loading}
          nowrap={true}
        />
        <ConfirmDialog
          isOpen={isOpen}
          onCancel={handleClose}
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
