import { EmailAuthProvider } from 'firebase/auth';
import { api } from '../../api';
import {
  createToaster,
  showToast,
  updateEmailPageHasError,
  updateEmailPageInitialState,
  updateEmailPageStateReducer,
} from '../../functions';
import { user$ } from '../auth';
import { UpdateUserInfoDialogState } from './update-user-info-dialog-state';

const dc = dict.accountSettings;

const toast = createToaster();

export namespace UpdateEmailPage {
  const [formState$, dispatch] = createReducer(
    updateEmailPageStateReducer,
    updateEmailPageInitialState
  );

  const enterButtonDisabled$ = formState$.chain(
    mapI((state) => state.isWaitingResponse || updateEmailPageHasError(state))
  );

  const emailFormIntent$: InitializedObservable<Intent> = formState$.chain(
    mapI((state) => (state.email.error === undefined ? 'primary' : 'danger'))
  );

  const passwordFormIntent$: InitializedObservable<Intent> = formState$.chain(
    mapI((state) => (state.password.error === undefined ? 'primary' : 'danger'))
  );

  const passwordIsOpenState = createBooleanState(false);

  export const togglePasswordLock = passwordIsOpenState.toggle;

  const { state$: passwordIsOpen$, setFalse: hidePassword } =
    passwordIsOpenState;

  export const state$ = combineLatestI([
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
      })
    )
  );

  const submit = async (user: FireAuthUser): Promise<void> => {
    const s = dispatch({ type: 'submit' });

    if (updateEmailPageHasError(s)) return;

    const currentEmail = user.email ?? '';

    const credential: AuthCredential = EmailAuthProvider.credential(
      currentEmail,
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

          UpdateUserInfoDialogState.closeDialog();

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
        res2.value.message
      );

      dispatch({ type: 'done' });

      UpdateUserInfoDialogState.closeDialog();

      showToast({
        toast,
        message: dc.updateEmail.message.error,
        intent: 'danger',
      });
      return;
    }

    dispatch({ type: 'done' });

    UpdateUserInfoDialogState.closeDialog();

    showToast({
      toast,
      message: dc.updateEmail.message.success,
      intent: 'success',
    });
  };

  export const enterClickHandler = (): void => {
    const { enterButtonDisabled, fireAuthUser } = mut_subscribedValues;

    if (enterButtonDisabled || fireAuthUser === undefined) return;

    submit(fireAuthUser).catch(console.error);
  };

  export const inputEmailHandler = (value: string): void => {
    dispatch({
      type: 'inputEmail',
      payload: value,
    });
  };

  export const inputPasswordHandler = (value: string): void => {
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

  user$.subscribe((v) => {
    mut_subscribedValues.fireAuthUser = v;
  });

  UpdateUserInfoDialogState.openingDialog$
    .chain(withLatestFromI(user$))
    .subscribe(([openingDialog, user]) => {
      if (openingDialog === undefined) {
        resetAllDialogState();
      }
      if (openingDialog === 'updateEmail') {
        dispatch({ type: 'inputEmail', payload: user?.email ?? '' });
      }
    });
}
