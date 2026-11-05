import type { Bindable, JSX } from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';
import { ButtonWithConfirm } from './button-with-confirm.js';

const dc = dict.eventSettingsPage.resetButton;

type Props = Readonly<{
  onConfirmClick: () => void;
  disabled?: Bindable<boolean>;
}>;

const buttonConfig = { name: dc.name } as const;

const dialogConfig = {
  intent: 'danger',
  icon: 'reset',
  message: dc.resetConfirmation,
  cancelButtonText: dict.common.buttonText.cancel,
  confirmButtonText: dict.common.buttonText.reset,
} as const;

const toastConfig = {
  message: dc.resetResultMessage,
  intent: 'success',
} as const;

export const ResetButton = ({
  onConfirmClick,
  disabled,
}: Props): JSX.Element => (
  <ButtonWithConfirm
    buttonConfig={buttonConfig}
    dialogConfig={dialogConfig}
    disabled={disabled}
    toastConfig={toastConfig}
    onConfirmClick={onConfirmClick}
  />
);
