import { type InitializedObservable, createState, scan } from 'synstate';

/** Which of the account dialogs is open, if any. */
export const createUpdateUserInfoDialogStore = (): UpdateUserInfoDialog => {
  const [
    openingDialogType$,
    setOpeningDialogType,
    { resetState: closeDialog },
  ] = createState<UpdateUserInfoDialogType | undefined>(undefined);

  // Counts every opening and closing of a dialog, so that a submit can tell
  // whether the dialog it started from is still the one on screen.
  const dialogSession$ = openingDialogType$.pipe(
    scan((session: number) => session + 1, 0),
  );

  const getDialogSession = (): number => dialogSession$.getSnapshot().value;

  const trackSession = (): (() => boolean) => {
    const session = getDialogSession();

    return () => getDialogSession() === session;
  };

  const changeUsername = (): void => {
    setOpeningDialogType('updateDisplayName');
  };

  const changeEmail = (): void => {
    setOpeningDialogType('updateEmail');
  };

  const changePassword = (): void => {
    setOpeningDialogType('updatePassword');
  };

  const deleteAccount = (): void => {
    setOpeningDialogType('deleteAccount');
  };

  const deleteAccountCreatedWithGoogle = (): void => {
    setOpeningDialogType('deleteAccountCreatedWithGoogle');
  };

  return {
    openingDialogType$,
    closeDialog,
    trackSession,
    changeUsername,
    changeEmail,
    changePassword,
    deleteAccount,
    deleteAccountCreatedWithGoogle,
  } as const;
};

export type UpdateUserInfoDialogType =
  | 'deleteAccount'
  | 'deleteAccountCreatedWithGoogle'
  | 'updateDisplayName'
  | 'updateEmail'
  | 'updatePassword';

export type UpdateUserInfoDialog = Readonly<{
  openingDialogType$: InitializedObservable<
    UpdateUserInfoDialogType | undefined
  >;
  closeDialog: () => void;
  /**
   * Taken when a submit starts: whether the dialog it started from is still
   * open, neither closed nor closed and opened again since. A submit stops at
   * its next step once it is not, and leaves the form, which closing reset and
   * which now belongs to the dialog on screen, alone.
   */
  trackSession: () => () => boolean;
  changeUsername: () => void;
  changeEmail: () => void;
  changePassword: () => void;
  deleteAccount: () => void;
  deleteAccountCreatedWithGoogle: () => void;
}>;
