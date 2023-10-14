import { Button } from '@blueprintjs/core';
import { ButtonWithConfirm } from './button-with-confirm';

const dc = dict.eventSettingsPage.backToAnswerPageButton;

type Props = Readonly<{
  hasNoChanges: boolean;
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
  confirmButtonText: dc.name,
} as const;

const toastConfig = {
  message: dc.resetResultMessage,
  intent: 'none',
} as const;

export const BackToAnswerPageButton = memoNamed<Props>(
  'BackToAnswerPageButton',
  ({ hasNoChanges, onConfirmClick, disabled }) =>
    hasNoChanges ? (
      <Button onClick={onConfirmClick}>{buttonConfig.name}</Button>
    ) : (
      <ButtonWithConfirm
        buttonConfig={buttonConfig}
        dialogConfig={dialogConfig}
        disabled={disabled}
        toastConfig={toastConfig}
        onConfirmClick={onConfirmClick}
      />
    ),
);
