import { Button } from '@blueprintjs/core';
import { ButtonWithConfirm } from './button-with-confirm';

const dc = dict.eventSettingsPage;

type Props = Readonly<{
  loading: boolean;
  showConfirmationDialog: boolean;
  disabled: boolean;
  onConfirmClick: () => void;
}>;

const buttonConfig = {
  name: dc.editEventButton.name,
  intent: 'primary',
} as const;

const dialogConfig = {
  intent: 'danger',
  icon: 'warning-sign',
  message: dc.editEventButton.submitEditingConfirmation,
  cancelButtonText: dict.common.buttonText.cancel,
  confirmButtonText: dc.editEventButton.name,
} as const;

const toastConfig = {
  message: dc.editEventButton.cancelResultMessage,
  intent: 'none',
} as const;

export const SubmitEditingEventButton = memoNamed<Props>(
  'SubmitEditingEventButton',
  ({ showConfirmationDialog, loading, disabled, onConfirmClick }) =>
    showConfirmationDialog ? (
      <ButtonWithConfirm
        buttonConfig={buttonConfig}
        dialogConfig={dialogConfig}
        disabled={disabled}
        loading={loading}
        toastConfig={toastConfig}
        onConfirmClick={onConfirmClick}
      />
    ) : (
      <Button
        disabled={disabled}
        intent={'primary'}
        loading={loading}
        text={dc.editEventButton.name}
        onClick={onConfirmClick}
      />
    )
);
