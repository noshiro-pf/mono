import type { Intent } from '@blueprintjs/core';
import {
  useAlive,
  useAsyncReducer,
  useToggleState,
} from '@noshiro/react-utils';
import { Result } from '@noshiro/ts-utils';
import type { AuthCredential, User } from 'firebase/auth';
import { EmailAuthProvider } from 'firebase/auth';
import { useCallback, useMemo } from 'react';
import { reauthenticateWithCredential, updatePassword } from '../../api';
import { dict } from '../../constants';
import type { UpdatePasswordPageState } from '../../functions';
import {
  createToaster,
  showToast,
  updatePasswordPageHasError,
  updatePasswordPageInitialState,
  updatePasswordPageStateReducer,
} from '../../functions';

const dc = dict.accountSettings;

const toast = createToaster();

export const useUpdatePasswordDialogState = (
  currentEmail: string,
  closeDialog: () => void,
  user: DeepReadonly<User>
): DeepReadonly<{
  state: UpdatePasswordPageState;
  enterClickHandler: () => void;
  inputOldPasswordHandler: (value: string) => void;
  inputNewPasswordHandler: (value: string) => void;
  oldPasswordFormIntent: Intent;
  newPasswordFormIntent: Intent;
  oldPasswordIsOpen: boolean;
  newPasswordIsOpen: boolean;
  toggleOldPasswordLock: () => void;
  toggleNewPasswordLock: () => void;
  enterButtonDisabled: boolean;
}> => {
  const [state, dispatch] = useAsyncReducer(
    updatePasswordPageStateReducer,
    updatePasswordPageInitialState
  );

  const alive = useAlive();

  const onSubmit = useCallback(
    async (
      p: DeepReadonly<{
        currentEmail: string;
        oldPassword: string;
        newPassword: string;
        user: DeepReadonly<User>;
        closeDialog: () => void;
      }>
    ): Promise<void> => {
      const s = await dispatch({ type: 'submit' });

      if (updatePasswordPageHasError(s)) return;

      const credential: DeepReadonly<AuthCredential> =
        EmailAuthProvider.credential(p.currentEmail, p.oldPassword);

      const res1 = await reauthenticateWithCredential(p.user, credential);

      if (!alive.current) return;

      if (Result.isErr(res1)) {
        switch (res1.value.code) {
          case 'auth/wrong-password':
            await dispatch({
              type: 'setOldPasswordError',
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

      const res2 = await updatePassword(p.user, p.newPassword);

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
    () => state.isWaitingResponse || updatePasswordPageHasError(state),
    [state]
  );

  const enterClickHandler = useCallback(async () => {
    if (enterButtonDisabled) return;

    await onSubmit({
      currentEmail,
      oldPassword: state.oldPassword.inputValue,
      newPassword: state.newPassword.inputValue,
      user,
      closeDialog,
    });
  }, [state, enterButtonDisabled, currentEmail, user, closeDialog, onSubmit]);

  const inputOldPasswordHandler = useCallback(
    (value: string) => {
      dispatch({
        type: 'inputOldPassword',
        payload: value,
      }).catch(console.error);
    },
    [dispatch]
  );

  const inputNewPasswordHandler = useCallback(
    (value: string) => {
      dispatch({
        type: 'inputNewPassword',
        payload: value,
      }).catch(console.error);
    },
    [dispatch]
  );

  const oldPasswordFormIntent: Intent =
    state.oldPassword.error === undefined ? 'primary' : 'danger';

  const newPasswordFormIntent: Intent =
    state.newPassword.error === undefined ? 'primary' : 'danger';

  const [oldPasswordIsOpen, toggleOldPasswordLock] = useToggleState(false);
  const [newPasswordIsOpen, toggleNewPasswordLock] = useToggleState(false);

  return {
    state,
    enterClickHandler,
    inputOldPasswordHandler,
    inputNewPasswordHandler,
    oldPasswordFormIntent,
    newPasswordFormIntent,
    oldPasswordIsOpen,
    newPasswordIsOpen,
    toggleOldPasswordLock,
    toggleNewPasswordLock,
    enterButtonDisabled,
  };
};
