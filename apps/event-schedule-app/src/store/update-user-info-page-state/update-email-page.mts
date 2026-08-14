import { EmailAuthProvider } from 'firebase/auth';
import {
  type InitializedObservable,
  combine,
  map,
  withCurrentValueFrom,
} from 'synstate';
import { createBooleanState, createReducer } from 'synstate-react-hooks';
import { Result } from 'ts-data-forge';
import { api } from '../../api/index.mjs';
import {
  createToaster,
  showToast,
  updateEmailPageHasError,
  updateEmailPageInitialState,
  updateEmailPageStateReducer,
} from '../../functions/index.mjs';
import { Auth } from '../auth.mjs';
import { UpdateUserInfoDialogStore } from './update-user-info-dialog-state.mjs';

const dc = dict.accountSettings;

const toast = createToaster();

const [, dispatch, { state: formState$ }] = createReducer(
  updateEmailPageStateReducer,
  updateEmailPageInitialState,
);

const enterButtonDisabled$ = formState$.pipe(
  map((st) => st.isWaitingResponse || updateEmailPageHasError(st)),
);

const emailFormIntent$: InitializedObservable<Intent> = formState$.pipe(
  map((st) => (st.email.error === undefined ? 'primary' : 'danger')),
);

const passwordFormIntent$: InitializedObservable<Intent> = formState$.pipe(
  map((st) => (st.password.error === undefined ? 'primary' : 'danger')),
);

const [
  ,
  {
    state: passwordIsOpen$,
    setFalse: hidePassword,
    toggle: togglePasswordLock,
  },
] = createBooleanState(false);

const state = combine([
  formState$,
  enterButtonDisabled$,
  emailFormIntent$,
  passwordFormIntent$,
  passwordIsOpen$,
]).pipe(
  map(
    ([
      formState,
      enterButtonDisabled,
      emailFormIntent,
      passwordFormIntent,
      passwordIsOpen,
    ]) => ({
      formState,
      enterButtonDisabled,
      emailFormIntent,
      passwordFormIntent,
      passwordIsOpen,
    }),
  ),
);

const submit = async (user: FireAuthUser): Promise<void> => {
  const s = dispatch({ type: 'submit' });

  if (updateEmailPageHasError(s)) return;

  const currentEmail = user.email ?? '';

  const credential: AuthCredential = EmailAuthProvider.credential(
    currentEmail,
    s.password.inputValue,
  );

  const res1 = await api.auth.reauthenticateWithCredential(user, credential);

  if (Result.isErr(res1)) {
    switch (res1.value.code) {
      case 'auth/wrong-password':
        dispatch({
          type: 'setPasswordError',
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

  const res2 = await api.auth.update.email(user, s.email.inputValue);

  if (Result.isErr(res2)) {
    console.error(
      'error occurred on updateEmail:',
      res2.value.code,
      res2.value.message,
    );

    dispatch({ type: 'done' });

    UpdateUserInfoDialogStore.closeDialog();

    showToast({
      toast,
      message: dc.updateEmail.message.error,
      intent: 'danger',
    });

    return;
  }

  dispatch({ type: 'done' });

  UpdateUserInfoDialogStore.closeDialog();

  showToast({
    toast,
    message: dc.updateEmail.message.success,
    intent: 'success',
  });
};

const enterClickHandler = (): void => {
  const enterButtonDisabled = enterButtonDisabled$.getSnapshot().value;

  const fireAuthUser = Auth.getFireAuthUserSnapshot();

  if (enterButtonDisabled || fireAuthUser === undefined) return;

  // TODO: use toast
  submit(fireAuthUser).catch(console.error);
};

const inputEmailHandler = (value: string): void => {
  dispatch({ type: 'inputEmail', payload: value });
};

const inputPasswordHandler = (value: string): void => {
  dispatch({ type: 'inputPassword', payload: value });
};

const resetAllDialogState = (): void => {
  dispatch({ type: 'reset' });

  hidePassword();
};

/* subscriptions */

UpdateUserInfoDialogStore.openingDialogType$
  .pipe(withCurrentValueFrom(Auth.fireAuthUser$))
  .subscribe(([openingDialog, user]) => {
    switch (openingDialog) {
      case undefined:
        resetAllDialogState();

        break;

      case 'updateEmail':
        dispatch({ type: 'inputEmail', payload: user?.email ?? '' });

        break;

      case 'deleteAccount':
      case 'deleteAccountCreatedWithGoogle':
      case 'updateDisplayName':
      case 'updatePassword':
        break;
    }
  });

export const UpdateEmailPageStore = {
  togglePasswordLock,
  state,
  enterClickHandler,
  inputEmailHandler,
  inputPasswordHandler,
} as const;
