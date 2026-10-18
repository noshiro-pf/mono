import { type InitializedObservable, combine, filter, map } from 'synstate';
import { Result } from 'ts-data-forge';
import { api } from '../../api/index.mjs';
import { dict } from '../../constants/index.mjs';
import {
  createToaster,
  emailInputHasError,
  emailInputInitialState,
  emailInputStateReducer,
  showToast,
} from '../../functions/index.mjs';
import { createReducerWithActions } from '../../utils/index.mjs';
import { Auth } from '../auth.mjs';
import { UpdateUserInfoDialogStore } from './update-user-info-dialog-state.mjs';

const dc = dict.accountSettings;

const toast = createToaster();

const dialogClosed$ = UpdateUserInfoDialogStore.openingDialogType$.pipe(
  filter((openingDialog) => openingDialog === undefined),
);

const [, dispatch, { state: formState$ }] = createReducerWithActions(
  emailInputStateReducer,
  emailInputInitialState,
  [dialogClosed$.pipe(map(() => ({ type: 'reset' }) as const))],
);

const enterButtonDisabled$ = combine([formState$, Auth.fireAuthUser$]).pipe(
  map(
    ([formState, fireAuthUser]) => formState.inputValue !== fireAuthUser?.email,
  ),
);

const [, dispatchIsWaitingResponse, { state: isWaitingResponseState }] =
  createReducerWithActions(
    (_: boolean, isWaitingResponse: boolean) => isWaitingResponse,
    false,
    [dialogClosed$.pipe(map(() => false))],
  );

const setTrueIsWaitingResponse = (): void => {
  dispatchIsWaitingResponse(true);
};

const setFalseIsWaitingResponse = (): void => {
  dispatchIsWaitingResponse(false);
};

const emailFormIntent$: InitializedObservable<Intent> = formState$.pipe(
  map((st) => (st.error === undefined ? 'primary' : 'danger')),
);

const state = combine([
  formState$,
  enterButtonDisabled$,
  isWaitingResponseState,
  emailFormIntent$,
]).pipe(
  map(
    ([formState, enterButtonDisabled, isWaitingResponse, emailFormIntent]) => ({
      formState,
      enterButtonDisabled,
      isWaitingResponse,
      emailFormIntent,
    }),
  ),
);

const submit = async (user: FireAuthUser): Promise<void> => {
  const s = dispatch({ type: 'submit' });

  if (emailInputHasError(s)) {
    return;
  }

  setTrueIsWaitingResponse();

  const signInResult = await api.auth.googleSignInWithPopup();

  if (Result.isErr(signInResult)) {
    // TODO: use toast
    console.error(
      'error occurred on googleSignInWithPopup:',
      signInResult.value,
    );

    return;
  }

  const credential: AuthCredential | undefined = signInResult.value;

  if (credential === undefined) {
    return;
  }

  const res1 = await api.auth.reauthenticateWithCredential(user, credential);

  if (Result.isErr(res1)) {
    console.error(
      'error occurred on reauthenticateWithCredential:',
      res1.value.code,
      res1.value.message,
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
      res2.value.message,
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
  dispatch({ type: 'input', payload: value });
};

export const DeleteAccountCreatedWithGoogleStore = {
  state,
  enterClickHandler,
  inputEmailHandler,
} as const;
