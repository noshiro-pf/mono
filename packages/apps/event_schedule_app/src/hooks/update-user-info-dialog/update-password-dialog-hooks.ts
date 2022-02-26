import type { Intent } from '@blueprintjs/core';
import { useStreamValue } from '@noshiro/syncflow-react-hooks';
import type { User } from 'firebase/auth';
import { useCallback } from 'react';
import type { UpdatePasswordPageState } from '../../functions';
import { UpdatePasswordPage } from '../../store';

export const useUpdatePasswordDialogState = (
  user: DeepReadonly<User>
): DeepReadonly<{
  state: UpdatePasswordPageState;
  enterClickHandler: () => void;
  oldPasswordFormIntent: Intent;
  newPasswordFormIntent: Intent;
  oldPasswordIsOpen: boolean;
  newPasswordIsOpen: boolean;
  enterButtonDisabled: boolean;
}> => {
  const state = useStreamValue(UpdatePasswordPage.state$);

  const enterButtonDisabled = useStreamValue(
    UpdatePasswordPage.enterButtonDisabled$
  );

  const oldPasswordFormIntent: Intent = useStreamValue(
    UpdatePasswordPage.oldPasswordFormIntent$
  );

  const newPasswordFormIntent: Intent = useStreamValue(
    UpdatePasswordPage.newPasswordFormIntent$
  );

  const oldPasswordIsOpen = useStreamValue(
    UpdatePasswordPage.oldPasswordIsOpen$
  );
  const newPasswordIsOpen = useStreamValue(
    UpdatePasswordPage.newPasswordIsOpen$
  );

  const enterClickHandler = useCallback(async () => {
    if (enterButtonDisabled) return;

    await UpdatePasswordPage.submit({
      oldPassword: state.oldPassword.inputValue,
      newPassword: state.newPassword.password.inputValue,
      user,
    });
  }, [state, enterButtonDisabled, user]);

  return {
    state,
    enterClickHandler,
    oldPasswordFormIntent,
    newPasswordFormIntent,
    oldPasswordIsOpen,
    newPasswordIsOpen,
    enterButtonDisabled,
  };
};
