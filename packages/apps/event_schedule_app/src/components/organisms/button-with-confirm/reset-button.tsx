import { memoNamed } from '@noshiro/react-utils';
import { texts } from '../../../constants';
import { ButtonWithConfirm } from './button-with-confirm';

const vt = texts.eventSettingsPage.resetButton;

type Props = Readonly<{
  onConfirmClick: () => void;
  disabled?: boolean;
}>;

const buttonConfig = {
  name: vt.name,
} as const;

const dialogConfig = {
  intent: 'danger',
  icon: 'reset',
  message: vt.resetConfirmation,
  cancelButtonText: texts.buttonText.cancel,
  confirmButtonText: texts.buttonText.reset,
} as const;

const toastConfig = {
  message: vt.resetResultMessage,
  intent: 'success',
} as const;

export const ResetButton = memoNamed<Props>('ResetButton', (props) => (
  <ButtonWithConfirm
    onConfirmClick={props.onConfirmClick}
    buttonConfig={buttonConfig}
    dialogConfig={dialogConfig}
    toastConfig={toastConfig}
    disabled={props.disabled}
  />
));
