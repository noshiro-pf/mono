export namespace UpdateUserInfoDialogState {
  const {
    state$: _openingDialog$,
    setState: setOpeningDialog,
    resetState: _closeDialog,
  } = createState<
    | 'deleteAccount'
    | 'deleteAccountCreatedWithGoogle'
    | 'updateDisplayName'
    | 'updateEmail'
    | 'updatePassword'
    | undefined
  >(undefined);

  export const openingDialog$ = _openingDialog$;

  export const changeUsername = (): void => {
    setOpeningDialog('updateDisplayName');
  };

  export const changeEmail = (): void => {
    setOpeningDialog('updateEmail');
  };

  export const changePassword = (): void => {
    setOpeningDialog('updatePassword');
  };

  export const deleteAccount = (): void => {
    setOpeningDialog('deleteAccount');
  };

  export const deleteAccountCreatedWithGoogle = (): void => {
    setOpeningDialog('deleteAccountCreatedWithGoogle');
  };

  export const closeDialog = _closeDialog;
}
