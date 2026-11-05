import { type InitializedObservable, createState } from 'synstate';

/** Which of the account dialogs is open, if any. */
export const createUpdateUserInfoDialogStore = (): UpdateUserInfoDialog => {
  const [
    openingDialogType$,
    setOpeningDialogType,
    { resetState: closeDialog },
  ] = createState<UpdateUserInfoDialogType | undefined>(undefined);

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
  changeUsername: () => void;
  changeEmail: () => void;
  changePassword: () => void;
  deleteAccount: () => void;
  deleteAccountCreatedWithGoogle: () => void;
}>;
