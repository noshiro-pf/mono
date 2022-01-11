import { memoNamed } from '@noshiro/react-utils';
import { dict } from '../../../constants';
import { ButtonWithConfirm } from './button-with-confirm';

const dc = dict.eventSettingsPage.resetButton;

type Props = Readonly<{
  onConfirmClick: () => void;
  disabled?: boolean;
}>;

const buttonConfig = {
  name: dc.name,
} as const;

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

export const ResetButton = memoNamed<Props>('ResetButton', (props) => (
  <ButtonWithConfirm
    buttonConfig={buttonConfig}
    dialogConfig={dialogConfig}
    disabled={props.disabled}
    toastConfig={toastConfig}
    onConfirmClick={props.onConfirmClick}
  />
));
