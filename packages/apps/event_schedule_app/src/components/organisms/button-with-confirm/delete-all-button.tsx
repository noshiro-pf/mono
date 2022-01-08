import { memoNamed } from '@noshiro/react-utils';
import { dict } from '../../../constants';
import { ButtonWithConfirm } from './button-with-confirm';

type Props = Readonly<{
  onConfirmDeleteAll: () => void;
}>;

const vt = dict.eventSettingsPage.section2;

const buttonConfig = {
  name: vt.removeAllDates,
  icon: 'trash',
  intent: 'danger',
} as const;

const dialogConfig = {
  icon: 'trash',
  intent: 'danger',
  message: vt.removeAllConfirmation,
  cancelButtonText: dict.common.buttonText.cancel,
  confirmButtonText: dict.common.buttonText.delete,
} as const;

const toastConfig = {
  message: vt.removeAllResultMessage,
  intent: 'none',
} as const;

export const DeleteAllButton = memoNamed<Props>(
  'DeleteAllButton',
  ({ onConfirmDeleteAll }) => (
    <ButtonWithConfirm
      buttonConfig={buttonConfig}
      dialogConfig={dialogConfig}
      toastConfig={toastConfig}
      onConfirmClick={onConfirmDeleteAll}
    />
  )
);
