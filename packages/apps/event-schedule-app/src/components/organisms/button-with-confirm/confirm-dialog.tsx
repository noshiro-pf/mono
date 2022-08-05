import { Description } from '../../atoms';
import { AlertWithMaxWidth } from '../../bp';

type Props = Readonly<{
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  cancelButtonText: string;
  confirmButtonText: string;
  message: string;
  description?: string;
  icon: IconName | undefined;
  intent: Intent;
  loading?: boolean;
}>;

export const ConfirmDialog = memoNamed<Props>(
  'ConfirmDialog',
  ({
    isOpen,
    onCancel,
    onConfirm,
    cancelButtonText,
    confirmButtonText,
    message,
    description,
    icon,
    intent,
    loading,
  }) => (
    <AlertWithMaxWidth
      canEscapeKeyCancel={true}
      canOutsideClickCancel={true}
      cancelButtonText={cancelButtonText}
      confirmButtonText={confirmButtonText}
      icon={icon}
      intent={intent}
      isOpen={isOpen}
      loading={loading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <p>{message}</p>
      {description === undefined ? undefined : (
        <Description text={description} />
      )}
    </AlertWithMaxWidth>
  )
);
