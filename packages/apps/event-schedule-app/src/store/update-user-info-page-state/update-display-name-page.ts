import { api } from '../../api';
import {
  createToaster,
  showToast,
  updateDisplayNamePageHasError,
  updateDisplayNamePageInitialState,
  updateDisplayNamePageStateReducer,
} from '../../functions';
import { emitAuthStateChange, fireAuthUser$ } from '../auth';
import { UpdateUserInfoDialogState } from './update-user-info-dialog-state';

const dc = dict.accountSettings;

const toast = createToaster();

export namespace UpdateDisplayNamePage {
  const [formState$, dispatch] = createReducer(
    updateDisplayNamePageStateReducer,
    updateDisplayNamePageInitialState
  );

  const enterButtonDisabled$ = formState$.chain(
    mapI(
      (state) => state.isWaitingResponse || updateDisplayNamePageHasError(state)
    )
  );

  const displayNameFormIntent$: InitializedObservable<Intent> =
    formState$.chain(
      mapI((state) =>
        state.displayName.error === undefined ? 'primary' : 'danger'
      )
    );

  export const state$ = combineLatestI([
    formState$,
    enterButtonDisabled$,
    displayNameFormIntent$,
  ]).chain(
    mapI(([formState, enterButtonDisabled, displayNameFormIntent]) => ({
      formState,
      enterButtonDisabled,
      displayNameFormIntent,
    }))
  );

  const submit = async (user: FireAuthUser): Promise<void> => {
    const s = dispatch({ type: 'submit' });

    if (updateDisplayNamePageHasError(s)) return;

    const res = await api.auth.update.displayName(
      user,
      s.displayName.inputValue
    );

    if (Result.isErr(res)) {
      console.error(
        'error occurred on updateDisplayName:',
        res.value.code,
        res.value.message
      );

      dispatch({ type: 'done' });

      UpdateUserInfoDialogState.closeDialog();

      showToast({
        toast,
        message: dc.updateDisplayName.message.error,
        intent: 'danger',
      });
      return;
    }

    emitAuthStateChange(); // added because onAuthStateChanged doesn't fire on updateProfile

    dispatch({ type: 'done' });

    UpdateUserInfoDialogState.closeDialog();

    showToast({
      toast,
      message: dc.updateDisplayName.message.success,
      intent: 'success',
    });
  };

  export const enterClickHandler = (): void => {
    const { enterButtonDisabled, fireAuthUser } = mut_subscribedValues;

    if (enterButtonDisabled || fireAuthUser === undefined) return;

    // TODO: use toast
    submit(fireAuthUser).catch(console.error);
  };

  export const inputDisplayNameHandler = (value: string): void => {
    dispatch({
      type: 'inputDisplayName',
      payload: value,
    });
  };

  const resetAllDialogState = (): void => {
    dispatch({ type: 'reset' });
  };

  /* subscriptions */

  const mut_subscribedValues: {
    enterButtonDisabled: boolean;
    fireAuthUser: FireAuthUser | undefined;
  } = {
    enterButtonDisabled: true,
    fireAuthUser: undefined,
  };

  enterButtonDisabled$.subscribe((v) => {
    mut_subscribedValues.enterButtonDisabled = v;
  });

  fireAuthUser$.subscribe((v) => {
    mut_subscribedValues.fireAuthUser = v;
  });

  UpdateUserInfoDialogState.openingDialog$
    .chain(withLatestFromI(fireAuthUser$))
    .subscribe(([openingDialog, user]) => {
      if (openingDialog === undefined) {
        resetAllDialogState();
      }
      if (openingDialog === 'updateDisplayName') {
        dispatch({
          type: 'inputDisplayName',
          payload: user?.displayName ?? '',
        });
      }
    });
}
