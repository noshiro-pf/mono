import { IconName, Intent } from '@blueprintjs/core';
import { BpAlert } from '@mono/react-blueprintjs-utils';
import { memoNamed } from '@mono/react-utils';

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  cancelButtonText: string;
  confirmButtonText: string;
  message: string;
  icon: IconName | undefined;
  intent: Intent;
}

export const ConfirmDialog = memoNamed<Props>(
  'ConfirmDialog',
  ({
    isOpen,
    onCancel,
    onConfirm,
    cancelButtonText,
    confirmButtonText,
    message,
    icon,
    intent,
  }) => (
    <BpAlert
      isOpen={isOpen}
      onConfirm={onConfirm}
      onCancel={onCancel}
      cancelButtonText={cancelButtonText}
      confirmButtonText={confirmButtonText}
      intent={intent}
      icon={icon}
      canEscapeKeyCancel={true}
      canOutsideClickCancel={true}
    >
      <p>{message}</p>
    </BpAlert>
  )
);
