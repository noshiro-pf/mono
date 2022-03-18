import { memoNamed } from '@noshiro/react-utils';
import { match } from '@noshiro/ts-utils';
import { dict } from '../../../constants';
import { ButtonNowrapStyled } from '../../bp';
import { ButtonWithConfirm } from './button-with-confirm';

const dc = dict.answerPage.answerBeingEdited;

type Props = Readonly<{
  hasUnanswered: boolean;
  onConfirmSubmissionOfAnswer: () => void;
  loading: boolean;
  disabled: boolean;
  mode: 'creating' | 'editing';
}>;

const buttonConfigBase = {
  icon: 'tick',
  intent: 'primary',
} as const;

const buttonConfigCreating = {
  ...buttonConfigBase,
  name: dc.submitButton.create,
} as const;

const buttonConfigEditing = {
  ...buttonConfigBase,
  name: dc.submitButton.update,
} as const;

const dialogConfigBase = {
  icon: 'confirm',
  intent: 'primary',
  message: dc.submitButton.confirmPartiallyUnanswered,
  cancelButtonText: dict.common.buttonText.cancel,
} as const;

const dialogConfigCreating = {
  ...dialogConfigBase,
  confirmButtonText: dc.submitButton.create,
} as const;

const dialogConfigEditing = {
  ...dialogConfigBase,
  confirmButtonText: dc.submitButton.update,
} as const;

const toastConfig = {
  message: dc.deleteButton.deleteAnswerResultMessage,
  intent: 'success',
} as const;

export const SubmitAnswerButtonWithConfirmation = memoNamed<Props>(
  'SubmitAnswerButtonWithConfirmation',
  ({ hasUnanswered, onConfirmSubmissionOfAnswer, loading, disabled, mode }) =>
    hasUnanswered ? (
      <ButtonWithConfirm
        buttonConfig={match(mode, {
          creating: buttonConfigCreating,
          editing: buttonConfigEditing,
        })}
        dialogConfig={match(mode, {
          creating: dialogConfigCreating,
          editing: dialogConfigEditing,
        })}
        disabled={disabled}
        loading={loading}
        toastConfig={toastConfig}
        onConfirmClick={onConfirmSubmissionOfAnswer}
      />
    ) : (
      <SubmitAnswerButton
        disabled={disabled}
        loading={loading}
        mode={mode}
        onConfirmSubmissionOfAnswer={onConfirmSubmissionOfAnswer}
      />
    )
);

const SubmitAnswerButton = memoNamed<StrictOmit<Props, 'hasUnanswered'>>(
  'SubmitAnswerButton',
  ({ onConfirmSubmissionOfAnswer, loading, disabled, mode }) => (
    <ButtonNowrapStyled
      disabled={disabled}
      icon={'tick'}
      intent={'primary'}
      loading={loading}
      text={match(mode, {
        creating: dc.submitButton.create,
        editing: dc.submitButton.update,
      })}
      onClick={onConfirmSubmissionOfAnswer}
    />
  )
);
