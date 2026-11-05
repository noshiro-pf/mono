import { Button } from 'blueprint-synstate';
import { constant, If, type Bindable, type JSX } from 'synstate-dom';
import { match } from 'ts-data-forge';
import { dict } from '../../../constants/index.mjs';
import { AnswerPageStore } from '../../../store/index.mjs';
import { nowrapClass } from '../../styled/index.mjs';
import { ButtonWithConfirm } from './button-with-confirm.js';

const dc = dict.answerPage.answerBeingEdited;

type Props = Readonly<{
  hasUnanswered: Bindable<boolean>;
  loading: Bindable<boolean>;
  disabled: Bindable<boolean>;
  mode: 'creating' | 'editing';
}>;

const buttonConfigBase = { icon: 'tick', intent: 'primary' } as const;

const dialogConfigBase = {
  icon: 'confirm',
  intent: 'primary',
  message: dc.submitButton.confirmPartiallyUnanswered,
  cancelButtonText: dict.common.buttonText.cancel,
} as const;

/** Sends the answer; asks first while some dates are left unanswered. */
export const SubmitAnswerButtonWithConfirmation = ({
  hasUnanswered,
  loading,
  disabled,
  mode,
}: Props): JSX.Element => {
  const name = match(mode, {
    creating: dc.submitButton.create,
    editing: dc.submitButton.update,
  });

  return (
    <If
      cond={hasUnanswered}
      then={
        <ButtonWithConfirm
          buttonConfig={{ ...buttonConfigBase, name }}
          dialogConfig={{ ...dialogConfigBase, confirmButtonText: name }}
          disabled={disabled}
          loading={loading}
          onConfirmClick={AnswerPageStore.onSubmitAnswerClickPromise}
        />
      }
      else={
        <Button
          class={nowrapClass}
          data-e2e={constant('submit-answer-button')}
          disabled={disabled}
          icon={'tick'}
          intent={'primary'}
          loading={loading}
          text={constant(name)}
          onClick={AnswerPageStore.onSubmitAnswerClick}
        />
      }
    />
  );
};
