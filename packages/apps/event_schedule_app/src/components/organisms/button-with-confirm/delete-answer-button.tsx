import { memoNamed } from '@noshiro/react-utils';
import { dict } from '../../../constants';
import { ButtonWithConfirm } from './button-with-confirm';

type Props = Readonly<{
  onConfirmDeleteAnswer: () => Promise<void>;
  loading: boolean;
}>;

const vt = dict.answerPage.answerBeingEdited.deleteButton;

const buttonConfig = {
  name: dict.common.buttonText.delete,
  icon: 'trash',
  intent: 'danger',
} as const;

const dialogConfig = {
  icon: 'trash',
  intent: 'danger',
  message: vt.deleteAnswerConfirmation,
  cancelButtonText: dict.common.buttonText.cancel,
  confirmButtonText: dict.common.buttonText.delete,
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
