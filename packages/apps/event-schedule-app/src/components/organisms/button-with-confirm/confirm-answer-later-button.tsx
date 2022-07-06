import { AnswerPageStore } from '../../../store';
import { ButtonWithConfirm } from './button-with-confirm';

const dc = dict.answerPage.answerLater;

type Props = Readonly<{
  loading: boolean;
  disabled: boolean;
}>;

const buttonConfig = {
  icon: 'saved',
  intent: 'primary',
  name: dc.button,
} as const;

const dialogConfig = {
  icon: 'confirm',
  intent: 'primary',
  message: dc.message,
  description: dc.description,
  cancelButtonText: dict.common.buttonText.cancel,
  confirmButtonText: dc.confirmButton,
} as const;

export const AnswerLaterButtonWithConfirmation = memoNamed<Props>(
  'AnswerLaterButtonWithConfirmation',
  ({ loading, disabled }) => (
    <ButtonWithConfirm
      buttonConfig={buttonConfig}
      dialogConfig={dialogConfig}
      disabled={disabled}
      loading={loading}
      onConfirmClick={AnswerPageStore.onSubmitEmptyAnswerClick}
    />
  )
);
