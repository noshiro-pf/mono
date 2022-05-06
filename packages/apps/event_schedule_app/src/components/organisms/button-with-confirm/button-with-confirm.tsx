import { createToaster, showToast } from '../../../functions';
import { ButtonNowrapStyled } from '../../bp';
import { ConfirmDialog } from './confirm-dialog';

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
    const {
      state: isOpen,
      setTrue: handleOpen,
      setFalse: handleClose,
    } = useBoolState(false);

    const alive = useAlive();
    const onConfirm = useCallback(() => {
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
          color={buttonConfig.color}
          data-cy={'button-with-confirmation'}
          disabled={disabled}
          icon={buttonConfig.icon}
          intent={buttonConfig.intent ?? 'none'}
          loading={loading}
          minimal={buttonConfig.minimal}
          text={buttonConfig.name}
          onClick={handleOpen}
        />
        <ConfirmDialog
          cancelButtonText={dialogConfig.cancelButtonText}
          confirmButtonText={dialogConfig.confirmButtonText}
          description={dialogConfig.description}
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
