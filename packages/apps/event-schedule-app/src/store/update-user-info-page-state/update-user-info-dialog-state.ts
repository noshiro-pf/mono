const {
  state$: openingDialog$,
  setState: setOpeningDialog,
  resetState: closeDialog,
} = createState<
  | 'deleteAccount'
  | 'deleteAccountCreatedWithGoogle'
  | 'updateDisplayName'
  | 'updateEmail'
  | 'updatePassword'
  | undefined
>(undefined);

const changeUsername = (): void => {
  setOpeningDialog('updateDisplayName');
};

const changeEmail = (): void => {
  setOpeningDialog('updateEmail');
};

const changePassword = (): void => {
  setOpeningDialog('updatePassword');
};

const deleteAccount = (): void => {
  setOpeningDialog('deleteAccount');
};

const deleteAccountCreatedWithGoogle = (): void => {
  setOpeningDialog('deleteAccountCreatedWithGoogle');
};

export const UpdateUserInfoDialogStore = {
  openingDialog$,
  closeDialog,
  changeUsername,
  changeEmail,
  changePassword,
  deleteAccount,
  deleteAccountCreatedWithGoogle,
} as const;
