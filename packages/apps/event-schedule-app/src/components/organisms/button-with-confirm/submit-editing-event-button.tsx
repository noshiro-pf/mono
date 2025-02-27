import { Button } from '@blueprintjs/core';
import { EditEventScheduleStore } from '../../../store';
import { ButtonWithConfirm } from './button-with-confirm';

const dc = dict.eventSettingsPage;

type Props = Readonly<{
  loading: boolean;
  showConfirmationDialog: boolean;
  disabled: boolean;
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
  ({ showConfirmationDialog, loading, disabled }) =>
    showConfirmationDialog ? (
      <ButtonWithConfirm
        buttonConfig={buttonConfig}
        data-e2e={'update-event-settings-with-confirm'}
        dialogConfig={dialogConfig}
        disabled={disabled}
        loading={loading}
        toastConfig={toastConfig}
        onConfirmClick={EditEventScheduleStore.onEditEventClickPromise}
      />
    ) : (
      <Button
        data-e2e={'update-event-settings'}
        disabled={disabled}
        intent={'primary'}
        loading={loading}
        text={dc.editEventButton.name}
        onClick={EditEventScheduleStore.onEditEventClick}
      />
    ),
);
