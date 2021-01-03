import { IconName, Intent } from '@blueprintjs/core';
import { BpButton } from '@mono/react-blueprintjs-utils';
import { memoNamed, useBooleanState } from '@mono/react-utils';
import React, { useCallback } from 'react';
import { createToaster, showToast } from '../../../utils/toaster';
import { ConfirmDialog } from './confirm-dialog';

interface Props {
  onConfirmClick: (() => void) | (() => Promise<void>);
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
}

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

    const onConfirm = useCallback(() => {
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
        p.then(afterConfirm).catch(console.error);
      } else {
        afterConfirm();
      }
    }, [onConfirmClick, close, toastConfig]);

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
