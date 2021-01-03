import { memoNamed } from '@mono/react-utils';
import React from 'react';
import { texts } from '../../../constants/texts';
import { ButtonWithConfirm } from './button-with-confirm';

const vt = texts.eventSettingsPage.section2;

interface Props {
  onConfirmDeleteAll: () => void;
}

const buttonConfig = {
  name: vt.removeAllDates,
  intent: 'danger',
  icon: 'trash',
} as const;

const dialogConfig = {
  intent: 'danger',
  icon: 'trash',
  message: vt.removeAllConfirmation,
  cancelButtonText: texts.buttonText.cancel,
  confirmButtonText: texts.buttonText.delete,
} as const;

const toastConfig = {
  message: vt.removeAllResultMessage,
  intent: 'none',
} as const;

export const DeleteAllButton = memoNamed<Props>('DeleteAllButton', (props) => (
  <ButtonWithConfirm
    onConfirmClick={props.onConfirmDeleteAll}
    buttonConfig={buttonConfig}
    dialogConfig={dialogConfig}
    toastConfig={toastConfig}
  />
));
