import { Button } from 'blueprint-synstate';
import { createState } from 'synstate';
import { constant, If, type Bindable, type JSX } from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';
import { AnswerPageStore } from '../../../store/index.mjs';
import { nowrapClass } from '../../styled/index.mjs';
import { ButtonWithConfirm } from './button-with-confirm.js';
import { ForNonLoggedInUserDialog } from './for-non-logged-in-user-button.js';

const dc = dict.answerPage.answerLater;

type Props = Readonly<{
  loading: Bindable<boolean>;
  loggedIn: Bindable<boolean>;
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

/**
 * Sends an empty answer to fill in later, once confirmed; for a visitor who is
 * not signed in, says that it needs an account instead.
 */
export const AnswerLaterButtonWithConfirmation = ({
  loading,
  loggedIn,
}: Props): JSX.Element => (
  <If
    cond={loggedIn}
    then={
      <ButtonWithConfirm
        buttonConfig={buttonConfig}
        dialogConfig={dialogConfig}
        disabled={constant(false)}
        loading={loading}
        onConfirmClick={AnswerPageStore.onSubmitEmptyAnswerClick}
      />
    }
    else={<ForNonLoggedInUser loading={loading} />}
  />
);

const ForNonLoggedInUser = ({
  loading,
}: Readonly<{ loading: Bindable<boolean> }>): JSX.Element => {
  const [isOpen$, setIsOpen] = createState(false);

  return (
    <>
      <Button
        class={nowrapClass}
        data-e2e={constant('button-with-confirmation')}
        icon={buttonConfig.icon}
        intent={buttonConfig.intent}
        loading={loading}
        text={constant(buttonConfig.name)}
        onClick={() => {
          setIsOpen(true);
        }}
      />
      <ForNonLoggedInUserDialog
        cancel={() => {
          setIsOpen(false);
        }}
        isOpen={isOpen$}
      />
    </>
  );
};
