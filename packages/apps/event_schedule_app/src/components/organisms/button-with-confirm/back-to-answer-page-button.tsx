import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import { texts } from '../../../constants';
import { ButtonWithConfirm } from './button-with-confirm';

const vt = texts.eventSettingsPage.backToAnswerPageButton;

type Props = Readonly<{
  hasNoChanges: boolean;
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
  confirmButtonText: vt.name,
} as const;

const toastConfig = {
  message: vt.resetResultMessage,
  intent: 'none',
} as const;

export const BackToAnswerPageButton = memoNamed<Props>(
  'BackToAnswerPageButton',
  (props) =>
    props.hasNoChanges ? (
      <BpButton onClick={props.onConfirmClick}>{buttonConfig.name}</BpButton>
    ) : (
      <ButtonWithConfirm
        onConfirmClick={props.onConfirmClick}
        buttonConfig={buttonConfig}
        dialogConfig={dialogConfig}
        toastConfig={toastConfig}
        disabled={props.disabled}
      />
    )
);
