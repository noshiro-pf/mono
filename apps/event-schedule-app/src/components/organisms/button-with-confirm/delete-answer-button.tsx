import type { Bindable, JSX } from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';
import { ButtonWithConfirm } from './button-with-confirm.js';

const dc = dict.answerPage.answerBeingEdited.deleteButton;

type Props = Readonly<{
  onConfirmDeleteAnswer: () => Promise<void>;
  loading: Bindable<boolean>;
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

export const DeleteAnswerButton = ({
  onConfirmDeleteAnswer,
  loading,
}: Props): JSX.Element => (
  <ButtonWithConfirm
    buttonConfig={buttonConfig}
    dialogConfig={dialogConfig}
    loading={loading}
    // The store says whether the delete went through, which this cannot see.
    onConfirmClick={onConfirmDeleteAnswer}
  />
);
