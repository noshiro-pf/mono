import { api } from '../../api';
import {
  createToaster,
  showToast,
  updateDisplayNamePageHasError,
  updateDisplayNamePageInitialState,
  updateDisplayNamePageStateReducer,
} from '../../functions';
import { Auth } from '../auth';
import { UpdateUserInfoDialogStore } from './update-user-info-dialog-state';

const dc = dict.accountSettings;

const toast = createToaster();

const { state: formState$, dispatch } = createReducer(
  updateDisplayNamePageStateReducer,
  updateDisplayNamePageInitialState,
);

const enterButtonDisabled$ = formState$.chain(
  map((st) => st.isWaitingResponse || updateDisplayNamePageHasError(st)),
);

const displayNameFormIntent$: InitializedObservable<Intent> = formState$.chain(
  map((st) => (st.displayName.error === undefined ? 'primary' : 'danger')),
);

const state = combine([
  formState$,
  enterButtonDisabled$,
  displayNameFormIntent$,
]).chain(
  map(([formState, enterButtonDisabled, displayNameFormIntent]) => ({
    formState,
    enterButtonDisabled,
    displayNameFormIntent,
  })),
);

const submit = async (user: FireAuthUser): Promise<void> => {
  const s = dispatch({ type: 'submit' });

  if (updateDisplayNamePageHasError(s)) return;

  const res = await api.auth.update.displayName(user, s.displayName.inputValue);

  if (Result.isErr(res)) {
    console.error(
      'error occurred on updateDisplayName:',
      res.value.code,
      res.value.message,
    );

    dispatch({ type: 'done' });

    UpdateUserInfoDialogStore.closeDialog();

    showToast({
      toast,
      message: dc.updateDisplayName.message.error,
      intent: 'danger',
    });
    return;
  }

  Auth.emitAuthStateChange(); // added because onAuthStateChanged doesn't fire on updateProfile

  dispatch({ type: 'done' });

  UpdateUserInfoDialogStore.closeDialog();

  showToast({
    toast,
    message: dc.updateDisplayName.message.success,
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

const inputDisplayNameHandler = (value: string): void => {
  dispatch({
    type: 'inputDisplayName',
    payload: value,
  });
};

const resetAllDialogState = (): void => {
  dispatch({ type: 'reset' });
};

/* subscriptions */

UpdateUserInfoDialogStore.openingDialog$
  .chain(withCurrentValueFrom(Auth.fireAuthUser$))
  .subscribe(([openingDialog, fireAuthUser]) => {
    if (openingDialog === undefined) {
      resetAllDialogState();
    }
    if (openingDialog === 'updateDisplayName') {
      dispatch({
        type: 'inputDisplayName',
        payload: fireAuthUser?.displayName ?? '',
      });
    }
  });

export const UpdateDisplayNamePageStore = {
  state,
  enterClickHandler,
  inputDisplayNameHandler,
} as const;
