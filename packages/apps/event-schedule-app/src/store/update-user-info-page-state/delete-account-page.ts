import { EmailAuthProvider } from 'firebase/auth';
import { api } from '../../api';
import {
  createToaster,
  deleteAccountPageHasError,
  deleteAccountPageInitialState,
  deleteAccountPageStateReducer,
  showToast,
} from '../../functions';
import { Auth } from '../auth';
import { UpdateUserInfoDialogStore } from './update-user-info-dialog-state';

const dc = dict.accountSettings;

const toast = createToaster();

const [formState$, dispatch] = createReducer(
  deleteAccountPageStateReducer,
  deleteAccountPageInitialState
);

const enterButtonDisabled$ = formState$.chain(
  mapI((state) => state.isWaitingResponse || deleteAccountPageHasError(state))
);

const emailFormIntent$: InitializedObservable<Intent> = formState$.chain(
  mapI((state) => (state.email.error === undefined ? 'primary' : 'danger'))
);

const passwordFormIntent$: InitializedObservable<Intent> = formState$.chain(
  mapI((state) => (state.password.error === undefined ? 'primary' : 'danger'))
);

const {
  state$: passwordIsOpenState$,
  setFalse: hidePassword,
  toggle: togglePasswordLock,
} = createBooleanState(false);

const state$ = combineLatestI([
  formState$,
  enterButtonDisabled$,
  emailFormIntent$,
  passwordFormIntent$,
  passwordIsOpenState$,
]).chain(
  mapI(
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
    })
  )
);

const submit = async (user: FireAuthUser): Promise<void> => {
  const s = dispatch({ type: 'submit' });

  if (deleteAccountPageHasError(s)) return;

  const credential: AuthCredential = EmailAuthProvider.credential(
    s.email.inputValue,
    s.password.inputValue
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

  const res2 = await api.auth.deleteUser(user);

  if (Result.isErr(res2)) {
    console.error(
      'error occurred on deleteUser:',
      res2.value.code,
      res2.value.message
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
  const { enterButtonDisabled, fireAuthUser } = mut_subscribedValues;

  if (enterButtonDisabled || fireAuthUser === undefined) return;

  // TODO: use toast
  submit(fireAuthUser).catch(console.error);
};

const inputEmailHandler = (value: string): void => {
  dispatch({
    type: 'inputEmail',
    payload: value,
  });
};

const inputPasswordHandler = (value: string): void => {
  dispatch({
    type: 'inputPassword',
    payload: value,
  });
};

const resetAllDialogState = (): void => {
  dispatch({ type: 'reset' });
  hidePassword();
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

export const DeleteAccountPageStore = {
  state$,
  togglePasswordLock,
  enterClickHandler,
  inputEmailHandler,
  inputPasswordHandler,
} as const;
