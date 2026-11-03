import { Button } from 'blueprint-synstate';
import { constant, If, type Bindable, type JSX } from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';
import { ButtonWithConfirm } from './button-with-confirm.js';

const dc = dict.eventSettingsPage.backToAnswerPageButton;

type Props = Readonly<{
  hasNoChanges: Bindable<boolean>;
  onConfirmClick: () => void;
  disabled?: Bindable<boolean>;
}>;

const buttonConfig = { name: dc.name } as const;

const dialogConfig = {
  intent: 'danger',
  icon: 'reset',
  message: dc.resetConfirmation,
  cancelButtonText: dict.common.buttonText.cancel,
  confirmButtonText: dc.name,
} as const;

const toastConfig = { message: dc.resetResultMessage, intent: 'none' } as const;

/** Back to the answer page; asks first when there are changes to lose. */
export const BackToAnswerPageButton = ({
  hasNoChanges,
  onConfirmClick,
  disabled,
}: Props): JSX.Element => (
  <If
    cond={hasNoChanges}
    then={
      <Button onClick={onConfirmClick}>{constant(buttonConfig.name)}</Button>
    }
    else={
      <ButtonWithConfirm
        buttonConfig={buttonConfig}
        dialogConfig={dialogConfig}
        disabled={disabled}
        toastConfig={toastConfig}
        onConfirmClick={onConfirmClick}
      />
    }
  />
);
