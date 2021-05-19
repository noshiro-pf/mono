import { memoNamed } from '@noshiro/react-utils';
import { texts } from '../../../constants';
import { ButtonWithConfirm } from './button-with-confirm';

const vt = texts.eventSettingsPage.section2;

type Props = Readonly<{
  onConfirmDeleteAll: () => void;
}>;

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
