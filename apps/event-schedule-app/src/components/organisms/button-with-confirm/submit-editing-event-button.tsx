import { Button } from 'blueprint-synstate';
import { constant, If, type Bindable, type JSX } from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';
import { EditEventScheduleStore } from '../../../store/index.mjs';
import { ButtonWithConfirm } from './button-with-confirm.js';

const dc = dict.eventSettingsPage;

type Props = Readonly<{
  loading: Bindable<boolean>;
  showConfirmationDialog: Bindable<boolean>;
  disabled: Bindable<boolean>;
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

/** Saves the edited event; asks first when dates with answers are removed. */
export const SubmitEditingEventButton = ({
  showConfirmationDialog,
  loading,
  disabled,
}: Props): JSX.Element => (
  <If
    cond={showConfirmationDialog}
    then={
      <ButtonWithConfirm
        buttonConfig={buttonConfig}
        dialogConfig={dialogConfig}
        disabled={disabled}
        loading={loading}
        toastConfig={toastConfig}
        onConfirmClick={EditEventScheduleStore.onEditEventClickPromise}
      />
    }
    else={
      <Button
        data-e2e={constant('update-event-settings')}
        disabled={disabled}
        intent={'primary'}
        loading={loading}
        text={constant(dc.editEventButton.name)}
        onClick={EditEventScheduleStore.onEditEventClick}
      />
    }
  />
);
