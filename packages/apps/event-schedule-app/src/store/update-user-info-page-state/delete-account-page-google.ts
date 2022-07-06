import { api } from '../../api';
import {
  createToaster,
  emailInputHasError,
  emailInputInitialState,
  emailInputStateReducer,
  showToast,
} from '../../functions';
import { fireAuthUser$ } from '../auth';
import { UpdateUserInfoDialogStore } from './update-user-info-dialog-state';

const dc = dict.accountSettings;

const toast = createToaster();

export namespace DeleteAccountCreatedWithGoogleStore {
  const [formState$, dispatch] = createReducer(
    emailInputStateReducer,
    emailInputInitialState
  );

  const enterButtonDisabled$ = combineLatestI([
    formState$,
    fireAuthUser$,
  ]).chain(mapI(([formState, user]) => formState.inputValue !== user?.email));

  const {
    setFalse: setFalseIsWaitingResponse,
    setTrue: setTrueIsWaitingResponse,
    state$: isWaitingResponse$,
  } = createBooleanState(false);

  const emailFormIntent$: InitializedObservable<Intent> = formState$.chain(
    mapI((state) => (state.error === undefined ? 'primary' : 'danger'))
  );

  export const state$ = combineLatestI([
    formState$,
    enterButtonDisabled$,
    isWaitingResponse$,
    emailFormIntent$,
  ]).chain(
    mapI(
      ([
        formState,
        enterButtonDisabled,
        isWaitingResponse,
        emailFormIntent,
      ]) => ({
        formState,
        enterButtonDisabled,
        isWaitingResponse,
        emailFormIntent,
      })
    )
  );

  const submit = async (user: FireAuthUser): Promise<void> => {
    const s = dispatch({ type: 'submit' });

    if (emailInputHasError(s)) return;

    setTrueIsWaitingResponse();

    const signInResult = await api.auth.googleSignInWithPopup();

    if (Result.isErr(signInResult)) {
      // TODO: use toast
      console.error(
        'error occurred on googleSignInWithPopup:',
        signInResult.value
      );
      return;
    }

    const credential: AuthCredential | undefined = signInResult.value;

    if (credential === undefined) return;

    const res1 = await api.auth.reauthenticateWithCredential(user, credential);

    if (Result.isErr(res1)) {
      console.error(
        'error occurred on reauthenticateWithCredential:',
        res1.value.code,
        res1.value.message
      );

      setFalseIsWaitingResponse();
      UpdateUserInfoDialogStore.closeDialog();

      showToast({
        toast,
        message: dc.reauthenticate.message.error,
        intent: 'danger',
      });
      return;
    }

    const res2 = await api.auth.deleteUser(user);

    if (Result.isErr(res2)) {
      console.error(
        'error occurred on deleteUser:',
        res2.value.code,
        res2.value.message
      );

      setFalseIsWaitingResponse();
      UpdateUserInfoDialogStore.closeDialog();

      showToast({
        toast,
        message: dc.deleteAccount.message.error,
        intent: 'danger',
      });
      return;
    }

    setFalseIsWaitingResponse();
    UpdateUserInfoDialogStore.closeDialog();

    showToast({
      toast,
      message: dc.deleteAccount.message.success,
      intent: 'success',
    });
  };

  export const enterClickHandler = (): void => {
    const { enterButtonDisabled, fireAuthUser } = mut_subscribedValues;

    if (enterButtonDisabled || fireAuthUser === undefined) return;

    // TODO: use toast
    submit(fireAuthUser).catch(console.error);
  };

  export const inputEmailHandler = (value: string): void => {
    dispatch({
      type: 'input',
      payload: value,
    });
  };

  const resetAllDialogState = (): void => {
    dispatch({ type: 'reset' });
    setFalseIsWaitingResponse();
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

  fireAuthUser$.subscribe((v) => {
    mut_subscribedValues.fireAuthUser = v;
  });

  UpdateUserInfoDialogStore.openingDialog$.subscribe((openingDialog) => {
    if (openingDialog === undefined) {
      resetAllDialogState();
    }
  });
}
