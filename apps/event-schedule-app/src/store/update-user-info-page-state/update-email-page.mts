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
  updateEmailPageHasError,
  updateEmailPageInitialState,
  updateEmailPageStateReducer,
  type UpdateEmailPageState,
} from '../../functions/index.mjs';
import {
  createReducerWithActions,
  createToggleState,
} from '../../utils/index.mjs';
import type {
  AccountAuth,
  AccountAuthApi,
  AccountUser,
} from './account-deps.mjs';
import type { UpdateUserInfoDialog } from './update-user-info-dialog-state.mjs';

export type UpdateEmailPageDeps<User, ReauthCredential> = Readonly<{
  api: Readonly<{
    auth: StrictPick<
      AccountAuthApi<User, ReauthCredential>,
      'emailCredential' | 'reauthenticateWithCredential' | 'update'
    >;
  }>;
  auth: StrictPick<
    AccountAuth<User>,
    'fireAuthUser$' | 'getFireAuthUserSnapshot'
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
 * The dialog that changes the user's email: signing in again with the password,
 * then changing it.
 */
export const createUpdateEmailPageStore = <
  User extends AccountUser,
  ReauthCredential,
>(
  deps: UpdateEmailPageDeps<User, ReauthCredential>,
): UpdateEmailPage => {
  const dc = dict.accountSettings;

  /** Cleared when the dialog closes, and filled in when this one opens. */
  const dialogActions$ = deps.dialog.openingDialogType$
    .pipe(withCurrentValueFrom(deps.auth.fireAuthUser$))
    .pipe(
      map(([openingDialog, user]) => {
        switch (openingDialog) {
          case undefined:
            return { type: 'reset' } as const;

          case 'updateEmail':
            return { type: 'inputEmail', payload: user?.email ?? '' } as const;

          case 'deleteAccount':
          case 'deleteAccountCreatedWithGoogle':
          case 'updateDisplayName':
          case 'updatePassword':
            return undefined;
        }
      }),
    )
    .pipe(filter(isNotUndefined));

  const [, dispatch, { state: formState$ }] = createReducerWithActions(
    updateEmailPageStateReducer,
    updateEmailPageInitialState,
    [dialogActions$],
  );

  const enterButtonDisabled$ = formState$.pipe(
    map((st) => st.isWaitingResponse || updateEmailPageHasError(st)),
  );

  const emailFormIntent$: InitializedObservable<Intent> = formState$.pipe(
    map((st) => (st.email.error === undefined ? 'primary' : 'danger')),
  );

  const passwordFormIntent$: InitializedObservable<Intent> = formState$.pipe(
    map((st) => (st.password.error === undefined ? 'primary' : 'danger')),
  );

  const { state: passwordIsOpen$, toggle: togglePasswordLock } =
    createToggleState([
      deps.dialog.openingDialogType$.pipe(
        filter((openingDialog) => openingDialog === undefined),
      ),
    ]);

  const state = combine([
    formState$,
    enterButtonDisabled$,
    emailFormIntent$,
    passwordFormIntent$,
    passwordIsOpen$,
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

  const submit = async (user: User): Promise<void> => {
    const s = dispatch({ type: 'submit' });

    if (updateEmailPageHasError(s)) {
      return;
    }

    const currentEmail = user.email ?? '';

    const credential: ReauthCredential = deps.api.auth.emailCredential(
      currentEmail,
      s.password.inputValue,
    );

    const res1 = await deps.api.auth.reauthenticateWithCredential(
      user,
      credential,
    );

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

          deps.dialog.closeDialog();

          showToast({
            toast: deps.toast,
            message: dc.reauthenticate.message.error,
            intent: 'danger',
          });

          break;
      }

      return;
    }

    const res2 = await deps.api.auth.update.email(user, s.email.inputValue);

    if (Result.isErr(res2)) {
      console.error(
        'error occurred on updateEmail:',
        res2.value.code,
        res2.value.message,
      );

      dispatch({ type: 'done' });

      deps.dialog.closeDialog();

      showToast({
        toast: deps.toast,
        message: dc.updateEmail.message.error,
        intent: 'danger',
      });

      return;
    }

    dispatch({ type: 'done' });

    deps.dialog.closeDialog();

    showToast({
      toast: deps.toast,
      message: dc.updateEmail.message.success,
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

  const inputEmailHandler = (value: string): void => {
    dispatch({ type: 'inputEmail', payload: value });
  };

  const inputPasswordHandler = (value: string): void => {
    dispatch({ type: 'inputPassword', payload: value });
  };

  return {
    togglePasswordLock,
    state,
    enterClickHandler,
    inputEmailHandler,
    inputPasswordHandler,
  } as const;
};

export type UpdateEmailPage = Readonly<{
  togglePasswordLock: () => void;
  state: InitializedObservable<
    Readonly<{
      formState: UpdateEmailPageState;
      enterButtonDisabled: boolean;
      emailFormIntent: Intent;
      passwordFormIntent: Intent;
      passwordIsOpen: boolean;
    }>
  >;
  enterClickHandler: () => void;
  inputEmailHandler: (value: string) => void;
  inputPasswordHandler: (value: string) => void;
}>;
