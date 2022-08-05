import { AnswerPageStore } from '../../../store';
import { ButtonNowrapStyled } from '../../bp';
import { ButtonWithConfirm } from './button-with-confirm';
import { ForNonLoggedInUserDialog } from './for-non-logged-in-user-button';

const dc = dict.answerPage.answerLater;

type Props = Readonly<{
  loading: boolean;
  loggedIn: boolean;
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
  ({ loading, loggedIn }) => {
    const {
      state: isOpen,
      setTrue: openDialog,
      setFalse: closeDialog,
    } = useBoolState(false);

    return loggedIn ? (
      <ButtonWithConfirm
        buttonConfig={buttonConfig}
        dialogConfig={dialogConfig}
        disabled={false}
        loading={loading}
        onConfirmClick={AnswerPageStore.onSubmitEmptyAnswerClick}
      />
    ) : (
      <>
        <ButtonNowrapStyled
          data-cy={'button-with-confirmation'}
          icon={buttonConfig.icon}
          intent={buttonConfig.intent}
          loading={loading}
          text={buttonConfig.name}
          onClick={openDialog}
        />
        <ForNonLoggedInUserDialog cancel={closeDialog} isOpen={isOpen} />
      </>
    );
  }
);
