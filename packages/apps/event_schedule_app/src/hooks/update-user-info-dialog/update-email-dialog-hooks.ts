import type { Intent } from '@blueprintjs/core';
import {
  useAlive,
  useAsyncReducer,
  useToggleState,
} from '@noshiro/react-utils';
import { Result } from '@noshiro/ts-utils';
import type { AuthCredential, User } from 'firebase/auth';
import { EmailAuthProvider } from 'firebase/auth';
import { useCallback, useEffect, useMemo } from 'react';
import { reauthenticateWithCredential, updateEmail } from '../../api';
import { dict } from '../../constants';
import type { UpdateEmailPageState } from '../../functions';
import {
  createToaster,
  showToast,
  updateEmailPageHasError,
  updateEmailPageInitialState,
  updateEmailPageStateReducer,
} from '../../functions';

const dc = dict.accountSettings;

const toast = createToaster();

export const useUpdateEmailDialogState = (
  currentEmail: string,
  dialogIsOpen: boolean,
  closeDialog: () => void,
  user: DeepReadonly<User>
): DeepReadonly<{
  state: UpdateEmailPageState;
  enterClickHandler: () => void;
  inputEmailHandler: (value: string) => void;
  inputPasswordHandler: (value: string) => void;
  emailFormIntent: Intent;
  passwordFormIntent: Intent;
  passwordIsOpen: boolean;
  togglePasswordLock: () => void;
  enterButtonDisabled: boolean;
}> => {
  const [state, dispatch] = useAsyncReducer(
    updateEmailPageStateReducer,
    updateEmailPageInitialState
  );

  // initialize
  useEffect(() => {
    if (dialogIsOpen) {
      dispatch({ type: 'inputEmail', payload: currentEmail }).catch(
        console.error
      );
    }
  }, [dialogIsOpen, currentEmail, dispatch]);

  const alive = useAlive();

  const onSubmit = useCallback(
    async (
      p: DeepReadonly<{
        currentEmail: string;
        newEmail: string;
        passwordForCredential: string;
        user: DeepReadonly<User>;
        closeDialog: () => void;
      }>
    ): Promise<void> => {
      const s = await dispatch({ type: 'submit' });

      if (updateEmailPageHasError(s)) return;

      const credential: DeepReadonly<AuthCredential> =
        EmailAuthProvider.credential(p.currentEmail, p.passwordForCredential);

      const res1 = await reauthenticateWithCredential(p.user, credential);

      if (!alive.current) return;

      if (Result.isErr(res1)) {
        switch (res1.value.code) {
          case 'auth/wrong-password':
            await dispatch({
              type: 'setPasswordError',
              payload: dc.reauthenticate.message.wrongPassword,
            });
            break;

          default:
            console.error(
              'some error occurred on reauthenticateWithCredential:',
              res1.value.code,
              res1.value.message
            );
            await dispatch({ type: 'done' });
            p.closeDialog();
            showToast({
              toast,
              message: dc.reauthenticate.message.error,
              intent: 'danger',
            });
            break;
        }
        return;
      }

      const res2 = await updateEmail(p.user, p.newEmail);

      if (Result.isErr(res2)) {
        console.error(
          'some error occurred on updateEmail:',
          res2.value.code,
          res2.value.message
        );
        await dispatch({ type: 'done' });
        p.closeDialog();
        showToast({
          toast,
          message: dc.updateEmail.message.error,
          intent: 'danger',
        });
        return;
      }

      await dispatch({ type: 'done' });
      p.closeDialog();
      showToast({
        toast,
        message: dc.updateEmail.message.success,
        intent: 'success',
      });
    },
    [alive, dispatch]
  );

  const enterButtonDisabled = useMemo(
    () => state.isWaitingResponse || updateEmailPageHasError(state),
    [state]
  );

  const enterClickHandler = useCallback(async () => {
    if (enterButtonDisabled) return;

    await onSubmit({
      currentEmail,
      newEmail: state.email.inputValue,
      passwordForCredential: state.password.inputValue,
      user,
      closeDialog,
    });
  }, [state, enterButtonDisabled, currentEmail, user, closeDialog, onSubmit]);

  const inputEmailHandler = useCallback(
    (value: string) => {
      dispatch({
        type: 'inputEmail',
        payload: value,
      }).catch(console.error);
    },
    [dispatch]
  );

  const inputPasswordHandler = useCallback(
    (value: string) => {
      dispatch({
        type: 'inputPassword',
        payload: value,
      }).catch(console.error);
    },
    [dispatch]
  );

  const emailFormIntent: Intent =
    state.email.error === undefined ? 'primary' : 'danger';

  const passwordFormIntent: Intent =
    state.password.error === undefined ? 'primary' : 'danger';

  const [passwordIsOpen, togglePasswordLock] = useToggleState(false);

  return {
    state,
    enterClickHandler,
    inputEmailHandler,
    inputPasswordHandler,
    emailFormIntent,
    passwordFormIntent,
    passwordIsOpen,
    togglePasswordLock,
    enterButtonDisabled,
  };
};
