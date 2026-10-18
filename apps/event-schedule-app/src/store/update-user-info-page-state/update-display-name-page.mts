import {
  type InitializedObservable,
  combine,
  filter,
  map,
  withCurrentValueFrom,
} from 'synstate';
import { Result, isNotUndefined } from 'ts-data-forge';
import { api } from '../../api/index.mjs';
import { dict } from '../../constants/index.mjs';
import {
  createToaster,
  showToast,
  updateDisplayNamePageHasError,
  updateDisplayNamePageInitialState,
  updateDisplayNamePageStateReducer,
} from '../../functions/index.mjs';
import { createReducerWithActions } from '../../utils/index.mjs';
import { Auth } from '../auth.mjs';
import { UpdateUserInfoDialogStore } from './update-user-info-dialog-state.mjs';

const dc = dict.accountSettings;

const toast = createToaster();

/** Cleared when the dialog closes, and filled in when this one opens. */
const dialogActions$ = UpdateUserInfoDialogStore.openingDialogType$
  .pipe(withCurrentValueFrom(Auth.fireAuthUser$))
  .pipe(
    map(([openingDialog, fireAuthUser]) => {
      switch (openingDialog) {
        case undefined:
          return { type: 'reset' } as const;

        case 'updateDisplayName':
          return {
            type: 'inputDisplayName',
            payload: fireAuthUser?.displayName ?? '',
          } as const;

        case 'deleteAccount':
        case 'deleteAccountCreatedWithGoogle':
        case 'updateEmail':
        case 'updatePassword':
          return undefined;
      }
    }),
  )
  .pipe(filter(isNotUndefined));

const [, dispatch, { state: formState$ }] = createReducerWithActions(
  updateDisplayNamePageStateReducer,
  updateDisplayNamePageInitialState,
  [dialogActions$],
);

const enterButtonDisabled$ = formState$.pipe(
  map((st) => st.isWaitingResponse || updateDisplayNamePageHasError(st)),
);

const displayNameFormIntent$: InitializedObservable<Intent> = formState$.pipe(
  map((st) => (st.displayName.error === undefined ? 'primary' : 'danger')),
);

const state = combine([
  formState$,
  enterButtonDisabled$,
  displayNameFormIntent$,
]).pipe(
  map(([formState, enterButtonDisabled, displayNameFormIntent]) => ({
    formState,
    enterButtonDisabled,
    displayNameFormIntent,
  })),
);

const submit = async (user: FireAuthUser): Promise<void> => {
  const s = dispatch({ type: 'submit' });

  if (updateDisplayNamePageHasError(s)) {
    return;
  }

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
  const enterButtonDisabled = enterButtonDisabled$.getSnapshot().value;

  const fireAuthUser = Auth.getFireAuthUserSnapshot();

  if (enterButtonDisabled || fireAuthUser === undefined) {
    return;
  }

  // TODO: use toast
  submit(fireAuthUser).catch(console.error);
};

const inputDisplayNameHandler = (value: string): void => {
  dispatch({ type: 'inputDisplayName', payload: value });
};

export const UpdateDisplayNamePageStore = {
  state,
  enterClickHandler,
  inputDisplayNameHandler,
} as const;
