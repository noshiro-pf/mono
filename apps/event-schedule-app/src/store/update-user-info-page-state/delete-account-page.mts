import { type InitializedObservable, combine, filter, map } from 'synstate';
import { Result } from 'ts-data-forge';
import { api } from '../../api/index.mjs';
import { dict } from '../../constants/index.mjs';
import {
  createToaster,
  deleteAccountPageHasError,
  deleteAccountPageInitialState,
  deleteAccountPageStateReducer,
  showToast,
} from '../../functions/index.mjs';
import {
  createReducerWithActions,
  createToggleState,
} from '../../utils/index.mjs';
import { Auth } from '../store.mjs';
import { UpdateUserInfoDialogStore } from './update-user-info-dialog-state.mjs';

const dc = dict.accountSettings;

const toast = createToaster();

const dialogClosed$ = UpdateUserInfoDialogStore.openingDialogType$.pipe(
  filter((openingDialog) => openingDialog === undefined),
);

const [, dispatch, { state: formState$ }] = createReducerWithActions(
  deleteAccountPageStateReducer,
  deleteAccountPageInitialState,
  [dialogClosed$.pipe(map(() => ({ type: 'reset' }) as const))],
);

const enterButtonDisabled$ = formState$.pipe(
  map((st) => st.isWaitingResponse || deleteAccountPageHasError(st)),
);

const emailFormIntent$: InitializedObservable<Intent> = formState$.pipe(
  map((st) => (st.email.error === undefined ? 'primary' : 'danger')),
);

const passwordFormIntent$: InitializedObservable<Intent> = formState$.pipe(
  map((st) => (st.password.error === undefined ? 'primary' : 'danger')),
);

const { state: passwordIsOpenState$, toggle: togglePasswordLock } =
  createToggleState([dialogClosed$]);

const state = combine([
  formState$,
  enterButtonDisabled$,
  emailFormIntent$,
  passwordFormIntent$,
  passwordIsOpenState$,
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

  if (deleteAccountPageHasError(s)) {
    return;
  }

  const credential: AuthCredential = api.auth.emailCredential(
    s.email.inputValue,
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

  const res2 = await api.auth.deleteUser(user);

  if (Result.isErr(res2)) {
    console.error(
      'error occurred on deleteUser:',
      res2.value.code,
      res2.value.message,
    );

    dispatch({ type: 'done' });

    UpdateUserInfoDialogStore.closeDialog();

    showToast({
      toast,
      message: dc.deleteAccount.message.error,
      intent: 'danger',
    });

    return;
  }

  dispatch({ type: 'done' });

  UpdateUserInfoDialogStore.closeDialog();

  showToast({
    toast,
    message: dc.deleteAccount.message.success,
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

const inputEmailHandler = (value: string): void => {
  dispatch({ type: 'inputEmail', payload: value });
};

const inputPasswordHandler = (value: string): void => {
  dispatch({ type: 'inputPassword', payload: value });
};

export const DeleteAccountPageStore = {
  state,
  togglePasswordLock,
  enterClickHandler,
  inputEmailHandler,
  inputPasswordHandler,
} as const;
