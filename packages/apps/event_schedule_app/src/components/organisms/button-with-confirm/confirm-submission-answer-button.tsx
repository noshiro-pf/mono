import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import { match } from '@noshiro/ts-utils';
import { texts } from '../../../constants';
import { ButtonWithConfirm } from './button-with-confirm';

type Props = Readonly<{
  hasUnanswered: boolean;
  onConfirmSubmissionOfAnswer: () => Promise<void>;
  loading: boolean;
  disabled: boolean;
  mode: 'creating' | 'editing';
}>;

const vt = texts.answerPage.answerBeingEdited;

const buttonConfigBase = {
  icon: 'tick',
  intent: 'primary',
} as const;

const buttonConfigCreating = {
  ...buttonConfigBase,
  name: vt.submitButton.create,
} as const;

const buttonConfigEditing = {
  ...buttonConfigBase,
  name: vt.submitButton.update,
} as const;

const dialogConfigBase = {
  icon: 'confirm',
  intent: 'primary',
  message: vt.submitButton.confirmPartiallyUnanswered,
  cancelButtonText: texts.buttonText.cancel,
} as const;

const dialogConfigCreating = {
  ...dialogConfigBase,
  confirmButtonText: vt.submitButton.create,
} as const;

const dialogConfigEditing = {
  ...dialogConfigBase,
  confirmButtonText: vt.submitButton.update,
} as const;

const toastConfig = {
  message: vt.deleteButton.deleteAnswerResultMessage,
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
    <BpButton
      disabled={disabled}
      icon='tick'
      intent='primary'
      loading={loading}
      nowrap={true}
      text={match(mode, {
        creating: vt.submitButton.create,
        editing: vt.submitButton.update,
      })}
      onClick={onConfirmSubmissionOfAnswer}
    />
  )
);
