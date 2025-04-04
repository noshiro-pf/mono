import { AlertWithMaxWidth } from '@noshiro/react-blueprintjs-utils';
import { Description } from '../../atoms';

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
      {mapOptional(description, (s) => (
        <Description text={s} />
      ))}
    </AlertWithMaxWidth>
  ),
);
