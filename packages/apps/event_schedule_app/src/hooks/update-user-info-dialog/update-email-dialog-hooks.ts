import type { Intent } from '@blueprintjs/core';
import { useStreamValue } from '@noshiro/syncflow-react-hooks';
import type { User } from 'firebase/auth';
import { useCallback } from 'react';
import type { UpdateEmailPageState } from '../../functions';
import { UpdateEmailPage } from '../../store';

export const useUpdateEmailDialogState = (
  user: DeepReadonly<User>
): DeepReadonly<{
  state: UpdateEmailPageState;
  emailFormIntent: Intent;
  passwordFormIntent: Intent;
  passwordIsOpen: boolean;
  enterButtonDisabled: boolean;
  enterClickHandler: () => void;
}> => {
  const state = useStreamValue(UpdateEmailPage.state$);

  const enterButtonDisabled = useStreamValue(
    UpdateEmailPage.enterButtonDisabled$
  );

  const emailFormIntent: Intent = useStreamValue(
    UpdateEmailPage.emailFormIntent$
  );

  const passwordFormIntent: Intent = useStreamValue(
    UpdateEmailPage.passwordFormIntent$
  );

  const passwordIsOpen = useStreamValue(UpdateEmailPage.passwordIsOpen$);

  const enterClickHandler = useCallback(async () => {
    if (enterButtonDisabled) return;

    await UpdateEmailPage.submit({
      newEmail: state.email.inputValue,
      passwordForCredential: state.password.inputValue,
      user,
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
