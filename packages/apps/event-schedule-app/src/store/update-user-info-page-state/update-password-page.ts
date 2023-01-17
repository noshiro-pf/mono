import { EmailAuthProvider } from 'firebase/auth';
import { api } from '../../api';
import {
  createToaster,
  showToast,
  updatePasswordPageHasError,
  updatePasswordPageInitialState,
  updatePasswordPageStateReducer,
} from '../../functions';
import { Auth } from '../auth';
import { UpdateUserInfoDialogStore } from './update-user-info-dialog-state';

const dc = dict.accountSettings;

const toast = createToaster();

const [formState$, dispatch] = createReducer(
  updatePasswordPageStateReducer,
  updatePasswordPageInitialState
);

const enterButtonDisabled$ = formState$.chain(
  mapI((state) => state.isWaitingResponse || updatePasswordPageHasError(state))
);

const oldPasswordFormIntent$: InitializedObservable<Intent> = formState$.chain(
  mapI((state) =>
    state.oldPassword.error === undefined ? 'primary' : 'danger'
  )
);

const newPasswordFormIntent$: InitializedObservable<Intent> = formState$.chain(
  mapI((state) =>
    state.newPassword.password.error === undefined &&
    state.newPassword.passwordConfirmation.error === undefined
      ? 'primary'
      : 'danger'
  )
);

const {
  state$: oldPasswordIsOpen$,
  setFalse: hideOldPassword,
  toggle: toggleOldPasswordLock,
} = createBooleanState(false);

const {
  state$: newPasswordIsOpen$,
  setFalse: hideNewPassword,
  toggle: toggleNewPasswordLock,
} = createBooleanState(false);

const state$ = combineLatestI([
  formState$,
  enterButtonDisabled$,
  oldPasswordFormIntent$,
  newPasswordFormIntent$,
  oldPasswordIsOpen$,
  newPasswordIsOpen$,
]).chain(
  mapI(
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
    })
  )
);

const submit = async (user: FireAuthUser): Promise<void> => {
  const s = dispatch({ type: 'submit' });

  if (updatePasswordPageHasError(s)) return;

  const currentEmail: string = user.email ?? '';

  const credential: AuthCredential = EmailAuthProvider.credential(
    currentEmail,
    s.oldPassword.inputValue
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
          res1.value.message
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
    s.newPassword.password.inputValue
  );

  if (Result.isErr(res2)) {
    console.error(
      'error occurred on updatePassword:',
      res2.value.code,
      res2.value.message
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
  const { enterButtonDisabled, fireAuthUser } = mut_subscribedValues;

  if (enterButtonDisabled || fireAuthUser === undefined) return;

  // TODO: use toast
  submit(fireAuthUser).catch(console.error);
};

const inputOldPasswordHandler = (value: string): void => {
  dispatch({
    type: 'inputOldPassword',
    payload: value,
  });
};

const inputNewPasswordHandler = (value: string): void => {
  dispatch({
    type: 'inputNewPassword',
    payload: value,
  });
};

const inputNewPasswordConfirmationHandler = (value: string): void => {
  dispatch({
    type: 'inputNewPasswordConfirmation',
    payload: value,
  });
};

const resetAllDialogState = (): void => {
  dispatch({ type: 'reset' });
  hideOldPassword();
  hideNewPassword();
};

/* subscriptions */

const mut_subscribedValues: {
  enterButtonDisabled: boolean;
  fireAuthUser: FireAuthUser | undefined;
} = {
  enterButtonDisabled: true,
  fireAuthUser: undefined,
};

enterButtonDisabled$.subscribe((v) => {
  mut_subscribedValues.enterButtonDisabled = v;
});

Auth.fireAuthUser$.subscribe((u) => {
  mut_subscribedValues.fireAuthUser = u;
});

UpdateUserInfoDialogStore.openingDialog$.subscribe((openingDialog) => {
  if (openingDialog === undefined) {
    resetAllDialogState();
  }
});

export const UpdatePasswordPageStore = {
  state$,
  toggleOldPasswordLock,
  inputOldPasswordHandler,
  inputNewPasswordHandler,
  toggleNewPasswordLock,
  inputNewPasswordConfirmationHandler,
  enterClickHandler,
} as const;
