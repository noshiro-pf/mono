import { memoNamed } from '@noshiro/react-utils';
import { dict } from '../../../constants';
import { ButtonWithConfirm } from './button-with-confirm';

const dc = dict.eventSettingsPage.section2;

type Props = Readonly<{
  onConfirmDeleteAll: () => void;
}>;

const buttonConfig = {
  name: dc.removeAllDates,
  icon: 'trash',
  intent: 'danger',
} as const;

const dialogConfig = {
  icon: 'trash',
  intent: 'danger',
  message: dc.removeAllConfirmation,
  cancelButtonText: dict.common.buttonText.cancel,
  confirmButtonText: dict.common.buttonText.delete,
} as const;

const toastConfig = {
  message: dc.removeAllResultMessage,
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
