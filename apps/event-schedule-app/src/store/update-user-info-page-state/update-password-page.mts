import { type InitializedObservable, combine, filter, map } from 'synstate';
import { Result } from 'ts-data-forge';
import { api } from '../../api/index.mjs';
import { dict } from '../../constants/index.mjs';
import {
  createToaster,
  showToast,
  updatePasswordPageHasError,
  updatePasswordPageInitialState,
  updatePasswordPageStateReducer,
} from '../../functions/index.mjs';
import {
  createReducerWithActions,
  createToggleState,
} from '../../utils/index.mjs';
import { Auth } from '../auth.mjs';
import { UpdateUserInfoDialogStore } from './update-user-info-dialog-state.mjs';

const dc = dict.accountSettings;

const toast = createToaster();

const dialogClosed$ = UpdateUserInfoDialogStore.openingDialogType$.pipe(
  filter((openingDialog) => openingDialog === undefined),
);

const [, dispatch, { state: formState$ }] = createReducerWithActions(
  updatePasswordPageStateReducer,
  updatePasswordPageInitialState,
  [dialogClosed$.pipe(map(() => ({ type: 'reset' }) as const))],
);

const enterButtonDisabled$ = formState$.pipe(
  map((st) => st.isWaitingResponse || updatePasswordPageHasError(st)),
);

const oldPasswordFormIntent$: InitializedObservable<Intent> = formState$.pipe(
  map((st) => (st.oldPassword.error === undefined ? 'primary' : 'danger')),
);

const newPasswordFormIntent$: InitializedObservable<Intent> = formState$.pipe(
  map((st) =>
    st.newPassword.password.error === undefined &&
    st.newPassword.passwordConfirmation.error === undefined
      ? 'primary'
      : 'danger',
  ),
);

const { state: oldPasswordIsOpen$, toggle: toggleOldPasswordLock } =
  createToggleState([dialogClosed$]);

const { state: newPasswordIsOpen$, toggle: toggleNewPasswordLock } =
  createToggleState([dialogClosed$]);

const state = combine([
  formState$,
  enterButtonDisabled$,
  oldPasswordFormIntent$,
  newPasswordFormIntent$,
  oldPasswordIsOpen$,
  newPasswordIsOpen$,
]).pipe(
  map(
    ([
      formState,
      enterButtonDisabled,
      oldPasswordFormIntent,
      newPasswordFormIntent,
      oldPasswordIsOpen,
      newPasswordIsOpen,
    ]) => ({
      formState,
      enterButtonDisabled,
      oldPasswordFormIntent,
      newPasswordFormIntent,
      oldPasswordIsOpen,
      newPasswordIsOpen,
    }),
  ),
);

const submit = async (user: FireAuthUser): Promise<void> => {
  const s = dispatch({ type: 'submit' });

  if (updatePasswordPageHasError(s)) {
    return;
  }

  const currentEmail: string = user.email ?? '';

  const credential: AuthCredential = api.auth.emailCredential(
    currentEmail,
    s.oldPassword.inputValue,
  );

  const res1 = await api.auth.reauthenticateWithCredential(user, credential);

  if (Result.isErr(res1)) {
    switch (res1.value.code) {
      case 'auth/wrong-password':
        dispatch({
          type: 'setOldPasswordError',
          payload: dc.reauthenticate.message.wrongPassword,
        });

        break;

      default:
        console.error(
          'error occurred on reauthenticateWithCredential:',
          res1.value.code,
          res1.value.message,
        );

        dispatch({ type: 'done' });

        UpdateUserInfoDialogStore.closeDialog();

        showToast({
          toast,
          message: dc.reauthenticate.message.error,
          intent: 'danger',
        });

        break;
    }

    return;
  }

  const res2 = await api.auth.update.password(
    user,
    s.newPassword.password.inputValue,
  );

  if (Result.isErr(res2)) {
    console.error(
      'error occurred on updatePassword:',
      res2.value.code,
      res2.value.message,
    );

    dispatch({ type: 'done' });

    UpdateUserInfoDialogStore.closeDialog();

    showToast({
      toast,
      message: dc.updatePassword.message.error,
      intent: 'danger',
    });

    return;
  }

  dispatch({ type: 'done' });

  UpdateUserInfoDialogStore.closeDialog();

  showToast({
    toast,
    message: dc.updatePassword.message.success,
    intent: 'success',
  });
};

const enterClickHandler = (): void => {
  const enterButtonDisabled = enterButtonDisabled$.getSnapshot().value;

  const fireAuthUser = Auth.getFireAuthUserSnapshot();

  if (enterButtonDisabled || fireAuthUser === undefined) {
    return;
  }

  // TODO: use toast
  submit(fireAuthUser).catch(console.error);
};

const inputOldPasswordHandler = (value: string): void => {
  dispatch({ type: 'inputOldPassword', payload: value });
};

const inputNewPasswordHandler = (value: string): void => {
  dispatch({ type: 'inputNewPassword', payload: value });
};

const inputNewPasswordConfirmationHandler = (value: string): void => {
  dispatch({ type: 'inputNewPasswordConfirmation', payload: value });
};

export const UpdatePasswordPageStore = {
  state,
  toggleOldPasswordLock,
  inputOldPasswordHandler,
  inputNewPasswordHandler,
  toggleNewPasswordLock,
  inputNewPasswordConfirmationHandler,
  enterClickHandler,
} as const;
