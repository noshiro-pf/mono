import type { Toaster } from '@blueprintjs/core';
import {
  combine,
  filter,
  map,
  withCurrentValueFrom,
  type InitializedObservable,
} from 'synstate';
import { Result, isNotUndefined } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import { dict } from '../../constants/index.mjs';
import {
  showToast,
  updateDisplayNamePageHasError,
  updateDisplayNamePageInitialState,
  updateDisplayNamePageStateReducer,
  type UpdateDisplayNamePageState,
} from '../../functions/index.mjs';
import { createReducerWithActions } from '../../utils/index.mjs';
import type {
  AccountAuth,
  AccountAuthApi,
  AccountUser,
} from './account-deps.mjs';
import type { UpdateUserInfoDialog } from './update-user-info-dialog-state.mjs';

export type UpdateDisplayNamePageDeps<User> = Readonly<{
  api: Readonly<{
    auth: StrictPick<AccountAuthApi<User, never>, 'update'>;
  }>;
  auth: StrictPick<
    AccountAuth<User>,
    'emitAuthStateChange' | 'fireAuthUser$' | 'getFireAuthUserSnapshot'
  >;
  /** Which dialog is open; this one closes itself when done. */
  dialog: StrictPick<
    UpdateUserInfoDialog,
    'closeDialog' | 'openingDialogType$'
  >;
  /** Where the dialog says whether it went through. */
  toast: Promise<Toaster>;
}>;

/**
 * The dialog that changes the user's display name.
 */
export const createUpdateDisplayNamePageStore = <User extends AccountUser>(
  deps: UpdateDisplayNamePageDeps<User>,
): UpdateDisplayNamePage => {
  const dc = dict.accountSettings;

  /** Cleared when the dialog closes, and filled in when this one opens. */
  const dialogActions$ = deps.dialog.openingDialogType$
    .pipe(withCurrentValueFrom(deps.auth.fireAuthUser$))
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

  const submit = async (user: User): Promise<void> => {
    const s = dispatch({ type: 'submit' });

    if (updateDisplayNamePageHasError(s)) {
      return;
    }

    const res = await deps.api.auth.update.displayName(
      user,
      s.displayName.inputValue,
    );

    if (Result.isErr(res)) {
      console.error(
        'error occurred on updateDisplayName:',
        res.value.code,
        res.value.message,
      );

      dispatch({ type: 'done' });

      deps.dialog.closeDialog();

      showToast({
        toast: deps.toast,
        message: dc.updateDisplayName.message.error,
        intent: 'danger',
      });

      return;
    }

    deps.auth.emitAuthStateChange(); // added because onAuthStateChanged doesn't fire on updateProfile

    dispatch({ type: 'done' });

    deps.dialog.closeDialog();

    showToast({
      toast: deps.toast,
      message: dc.updateDisplayName.message.success,
      intent: 'success',
    });
  };

  const enterClickHandler = (): void => {
    const enterButtonDisabled = enterButtonDisabled$.getSnapshot().value;

    const fireAuthUser = deps.auth.getFireAuthUserSnapshot();

    if (enterButtonDisabled || fireAuthUser === undefined) {
      return;
    }

    // TODO: use toast
    submit(fireAuthUser).catch(console.error);
  };

  const inputDisplayNameHandler = (value: string): void => {
    dispatch({ type: 'inputDisplayName', payload: value });
  };

  return {
    state,
    enterClickHandler,
    inputDisplayNameHandler,
  } as const;
};

export type UpdateDisplayNamePage = Readonly<{
  state: InitializedObservable<
    Readonly<{
      formState: UpdateDisplayNamePageState;
      enterButtonDisabled: boolean;
      displayNameFormIntent: Intent;
    }>
  >;
  enterClickHandler: () => void;
  inputDisplayNameHandler: (value: string) => void;
}>;
