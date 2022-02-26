import type { Intent } from '@blueprintjs/core';
import { useStreamValue } from '@noshiro/syncflow-react-hooks';
import type { User } from 'firebase/auth';
import { useCallback } from 'react';
import type { DeleteAccountPageState } from '../../functions';
import { DeleteAccountPage, UpdateUserInfoDialogState } from '../../store';

export const useDeleteAccountPageState = (
  user: DeepReadonly<User>
): DeepReadonly<{
  state: DeleteAccountPageState;
  emailFormIntent: Intent;
  passwordFormIntent: Intent;
  passwordIsOpen: boolean;
  enterButtonDisabled: boolean;
  enterClickHandler: () => void;
}> => {
  const state = useStreamValue(DeleteAccountPage.state$);

  const enterButtonDisabled = useStreamValue(
    DeleteAccountPage.enterButtonDisabled$
  );

  const emailFormIntent: Intent = useStreamValue(
    DeleteAccountPage.emailFormIntent$
  );

  const passwordFormIntent: Intent = useStreamValue(
    DeleteAccountPage.passwordFormIntent$
  );

  const passwordIsOpen = useStreamValue(DeleteAccountPage.passwordIsOpen$);

  const enterClickHandler = useCallback(async () => {
    if (enterButtonDisabled) return;

    await DeleteAccountPage.submit({
      email: state.email.inputValue,
      password: state.password.inputValue,
      user,
      closeDialog: UpdateUserInfoDialogState.closeDialog,
    });
  }, [state, enterButtonDisabled, user]);

  return {
    state,
    emailFormIntent,
    passwordFormIntent,
    passwordIsOpen,
    enterButtonDisabled,
    enterClickHandler,
  };
};
