import type { InitializedObservable } from 'synstate';
import { createState } from 'synstate-react-hooks';

/** Which of the account dialogs is open, if any. */
export const createUpdateUserInfoDialogStore = (): UpdateUserInfoDialog => {
  const [
    useOpeningDialogType,
    setOpeningDialogType,
    { state: openingDialogType$, resetState: closeDialog },
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
    useOpeningDialogType,
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
  useOpeningDialogType: () => UpdateUserInfoDialogType | undefined;
  closeDialog: () => void;
  changeUsername: () => void;
  changeEmail: () => void;
  changePassword: () => void;
  deleteAccount: () => void;
  deleteAccountCreatedWithGoogle: () => void;
}>;
