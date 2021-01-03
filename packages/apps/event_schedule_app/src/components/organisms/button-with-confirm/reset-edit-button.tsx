import { memoNamed } from '@mono/react-utils';
import React from 'react';
import { texts } from '../../../constants/texts';
import { ButtonWithConfirm } from './button-with-confirm';

const vt = texts.eventSettingsPage.resetEditButton;

interface Props {
  onConfirmClick: () => void;
  disabled?: boolean;
}

const buttonConfig = {
  name: vt.name,
} as const;

const dialogConfig = {
  intent: 'danger',
  icon: 'reset',
  message: vt.resetConfirmation,
  cancelButtonText: texts.buttonText.cancel,
  confirmButtonText: vt.name,
} as const;

const toastConfig = {
  message: vt.resetResultMessage,
  intent: 'success',
} as const;

export const ResetEditButton = memoNamed<Props>('ResetEditButton', (props) => (
  <ButtonWithConfirm
    onConfirmClick={props.onConfirmClick}
    buttonConfig={buttonConfig}
    dialogConfig={dialogConfig}
    toastConfig={toastConfig}
    disabled={props.disabled}
  />
));
