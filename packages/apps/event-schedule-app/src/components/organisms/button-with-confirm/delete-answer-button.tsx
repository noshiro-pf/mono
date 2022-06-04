import { ButtonWithConfirm } from './button-with-confirm';

const dc = dict.answerPage.answerBeingEdited.deleteButton;

type Props = Readonly<{
  onConfirmDeleteAnswer: () => Promise<void>;
  loading: boolean;
}>;

const buttonConfig = {
  name: dict.common.buttonText.delete,
  icon: 'trash',
  intent: 'danger',
} as const;

const dialogConfig = {
  icon: 'trash',
  intent: 'danger',
  message: dc.deleteAnswerConfirmation,
  cancelButtonText: dict.common.buttonText.cancel,
  confirmButtonText: dict.common.buttonText.delete,
} as const;

const toastConfig = {
  message: dc.deleteAnswerResultMessage,
  intent: 'success',
} as const;

export const DeleteAnswerButton = memoNamed<Props>(
  'DeleteAnswerButton',
  ({ onConfirmDeleteAnswer, loading }) => (
    <ButtonWithConfirm
      buttonConfig={buttonConfig}
      dialogConfig={dialogConfig}
      loading={loading}
      toastConfig={toastConfig}
      onConfirmClick={onConfirmDeleteAnswer}
    />
  )
);
