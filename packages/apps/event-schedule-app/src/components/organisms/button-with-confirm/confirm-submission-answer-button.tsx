import { onSubmitAnswerClick } from '../../../store';
import { ButtonNowrapStyled } from '../../bp';
import { ButtonWithConfirm } from './button-with-confirm';

const dc = dict.answerPage.answerBeingEdited;

type Props = Readonly<{
  hasUnanswered: boolean;
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

export const SubmitAnswerButtonWithConfirmation = memoNamed<Props>(
  'SubmitAnswerButtonWithConfirmation',
  ({ hasUnanswered, loading, disabled, mode }) =>
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
        onConfirmClick={onSubmitAnswerClick}
      />
    ) : (
      <SubmitAnswerButton disabled={disabled} loading={loading} mode={mode} />
    )
);

const SubmitAnswerButton = memoNamed<StrictOmit<Props, 'hasUnanswered'>>(
  'SubmitAnswerButton',
  ({ loading, disabled, mode }) => (
    <ButtonNowrapStyled
      data-cy={'submit-answer-button'}
      disabled={disabled}
      icon={'tick'}
      intent={'primary'}
      loading={loading}
      text={match(mode, {
        creating: dc.submitButton.create,
        editing: dc.submitButton.update,
      })}
      onClick={onSubmitAnswerClick}
    />
  )
);
