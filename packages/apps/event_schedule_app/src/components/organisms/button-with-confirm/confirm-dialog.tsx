import type { IconName, Intent } from '@blueprintjs/core';
import { BpAlert } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';

type Props = Readonly<{
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  cancelButtonText: string;
  confirmButtonText: string;
  message: string;
  icon: IconName | undefined;
  intent: Intent;
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
    icon,
    intent,
  }) => (
    <BpAlert
      canEscapeKeyCancel={true}
      canOutsideClickCancel={true}
      cancelButtonText={cancelButtonText}
      confirmButtonText={confirmButtonText}
      icon={icon}
      intent={intent}
      isOpen={isOpen}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <p>{message}</p>
    </BpAlert>
  )
);
