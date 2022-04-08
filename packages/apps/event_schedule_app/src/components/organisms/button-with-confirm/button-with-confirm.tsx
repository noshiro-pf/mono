import type { IconName, Intent } from '@blueprintjs/core';
import { createToaster, showToast } from '../../../functions';
import { ButtonNowrapStyled } from '../../bp';
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
    const {
      state: isOpen,
      setTrue: handleOpen,
      setFalse: handleClose,
    } = useBoolState(false);

    const alive = useAlive();
    const onConfirm = useCallback(() => {
      if (!alive.current) return;
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
        p.then(() => {
          if (!alive.current) return;
          afterConfirm();
        }).catch(console.error);
      } else {
        afterConfirm();
      }
    }, [onConfirmClick, handleClose, toastConfig, alive]);

    return (
      <>
        <ButtonNowrapStyled
          disabled={disabled}
          icon={buttonConfig.icon}
          intent={buttonConfig.intent ?? 'none'}
          loading={loading}
          text={buttonConfig.name}
          onClick={handleOpen}
        />
        <ConfirmDialog
          cancelButtonText={dialogConfig.cancelButtonText}
          confirmButtonText={dialogConfig.confirmButtonText}
          icon={dialogConfig.icon}
          intent={dialogConfig.intent ?? 'none'}
          isOpen={isOpen}
          message={dialogConfig.message}
          onCancel={handleClose}
          onConfirm={onConfirm}
        />
      </>
    );
  }
);
