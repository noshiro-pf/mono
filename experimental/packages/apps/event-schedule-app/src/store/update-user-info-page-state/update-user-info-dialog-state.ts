const {
  useCurrentValue: useOpeningDialogType,
  state: openingDialogType$,
  setState: setOpeningDialogType,
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

export const UpdateUserInfoDialogStore = {
  openingDialogType$,
  useOpeningDialogType,
  closeDialog,
  changeUsername,
  changeEmail,
  changePassword,
  deleteAccount,
  deleteAccountCreatedWithGoogle,
} as const;
