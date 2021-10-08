import { memoNamed } from '@noshiro/react-utils';
import { texts } from '../../../constants';
import { ButtonWithConfirm } from '../button-with-confirm';

type Props = Readonly<{
  onConfirmDeleteAnswer: () => Promise<void>;
  loading: boolean;
}>;

const vt = texts.answerPage.answerBeingEdited.deleteButton;

const buttonConfig = {
  name: texts.buttonText.delete,
  icon: 'trash',
  intent: 'danger',
} as const;

const dialogConfig = {
  icon: 'trash',
  intent: 'danger',
  message: vt.deleteAnswerConfirmation,
  cancelButtonText: texts.buttonText.cancel,
  confirmButtonText: texts.buttonText.delete,
} as const;

const toastConfig = {
  message: vt.deleteAnswerResultMessage,
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
