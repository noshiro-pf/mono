import type { Intent } from '@blueprintjs/core';
import type { InitializedObservable } from '@noshiro/syncflow';
import {
  combineLatestI,
  createReducer,
  mapI,
  withLatestFromI,
} from '@noshiro/syncflow';
import type { User } from 'firebase/auth';
import { api } from '../../api';
import { dict } from '../../constants';
import {
  createToaster,
  showToast,
  updateDisplayNamePageHasError,
  updateDisplayNamePageInitialState,
  updateDisplayNamePageStateReducer,
} from '../../functions';
import { emitAuthStateChange, user$ } from '../auth';
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

  export const submit = async (user: DeepReadonly<User>): Promise<void> => {
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

  export const inputDisplayNameHandler = (value: string): void => {
    dispatch({
      type: 'inputDisplayName',
      payload: value,
    });
  };

  const resetAllDialogState = (): void => {
    dispatch({ type: 'reset' });
  };

  UpdateUserInfoDialogState.openingDialog$
    .chain(withLatestFromI(user$))
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
