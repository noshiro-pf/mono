import {
  derive,
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
import {
  describeAuthError,
  runSubmitSteps,
  settleAuthStep,
} from './auth-step.mjs';
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
    'closeDialog' | 'openingDialogType$' | 'trackSession'
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

  const [formState$, dispatch] = createReducerWithActions(
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

  const state = derive(
    [formState$, enterButtonDisabled$, displayNameFormIntent$],
    (formState, enterButtonDisabled, displayNameFormIntent) => ({
      formState,
      enterButtonDisabled,
      displayNameFormIntent,
    }),
  );

  const submit = async (user: User): Promise<void> => {
    const s = dispatch({ type: 'submit' });

    if (updateDisplayNamePageHasError(s)) {
      return;
    }

    // A submit whose dialog was closed meanwhile closes no dialog opened since.
    await runSubmitSteps(
      deps.dialog.trackSession,
      (isCurrent) => submitSteps(user, s, isCurrent),
      () => {
        dispatch({ type: 'done' });
      },
    );
  };

  /**
   * The step of `submit`, ending its wait as an `Err` when it rejects, so that
   * a rejection is reported as the step's own error is.
   */
  const submitSteps = async (
    user: User,
    s: UpdateDisplayNamePageState,
    isCurrent: () => boolean,
  ): Promise<void> => {
    const res = await settleAuthStep(
      deps.api.auth.update.displayName(user, s.displayName.inputValue),
    );

    // The name is changed or not by now, so the toast says which even when the
    // dialog was closed meanwhile; only the dialog it started from is closed.
    if (isCurrent()) {
      deps.dialog.closeDialog();
    }

    if (Result.isErr(res)) {
      console.error(
        'error occurred on updateDisplayName:',
        ...describeAuthError(res.value),
      );

      showToast({
        toast: deps.toast,
        message: dc.updateDisplayName.message.error,
        intent: 'danger',
      });

      return;
    }

    deps.auth.emitAuthStateChange(); // added because onAuthStateChanged doesn't fire on updateProfile

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

    // `submit` reports the steps' failures; this only logs what reporting threw.
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
