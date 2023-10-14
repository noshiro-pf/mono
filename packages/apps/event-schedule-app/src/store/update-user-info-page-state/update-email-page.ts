import { EmailAuthProvider } from 'firebase/auth';
import { api } from '../../api';
import {
  createToaster,
  showToast,
  updateEmailPageHasError,
  updateEmailPageInitialState,
  updateEmailPageStateReducer,
} from '../../functions';
import { Auth } from '../auth';
import { UpdateUserInfoDialogStore } from './update-user-info-dialog-state';

const dc = dict.accountSettings;

const toast = createToaster();

const [formState$, dispatch] = createReducer(
  updateEmailPageStateReducer,
  updateEmailPageInitialState,
);

const enterButtonDisabled$ = formState$.chain(
  mapI((state) => state.isWaitingResponse || updateEmailPageHasError(state)),
);

const emailFormIntent$: InitializedObservable<Intent> = formState$.chain(
  mapI((state) => (state.email.error === undefined ? 'primary' : 'danger')),
);

const passwordFormIntent$: InitializedObservable<Intent> = formState$.chain(
  mapI((state) => (state.password.error === undefined ? 'primary' : 'danger')),
);

const {
  state$: passwordIsOpen$,
  setFalse: hidePassword,
  toggle: togglePasswordLock,
} = createBooleanState(false);

const state$ = combineLatestI([
  formState$,
  enterButtonDisabled$,
  emailFormIntent$,
  passwordFormIntent$,
  passwordIsOpen$,
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
  const enterButtonDisabled = enterButtonDisabled$.snapshot.value;
  const fireAuthUser = Auth.fireAuthUser$.snapshot.value;

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

UpdateUserInfoDialogStore.openingDialog$
  .chain(withLatestFromI(Auth.fireAuthUser$))
  .subscribe(([openingDialog, user]) => {
    if (openingDialog === undefined) {
      resetAllDialogState();
    }
    if (openingDialog === 'updateEmail') {
      dispatch({ type: 'inputEmail', payload: user?.email ?? '' });
    }
  });

export const UpdateEmailPageStore = {
  togglePasswordLock,
  state$,
  enterClickHandler,
  inputEmailHandler,
  inputPasswordHandler,
} as const;
