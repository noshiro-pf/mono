import type { Intent } from '@blueprintjs/core';
import { useAlive, useAsyncReducer } from '@noshiro/react-utils';
import { Result } from '@noshiro/ts-utils';
import type { User } from 'firebase/auth';
import { useCallback, useEffect, useMemo } from 'react';
import { updateDisplayName } from '../../api';
import { dict } from '../../constants';
import type { UpdateDisplayNamePageState } from '../../functions';
import {
  createToaster,
  showToast,
  updateDisplayNamePageHasError,
  updateDisplayNamePageInitialState,
  updateDisplayNamePageStateReducer,
} from '../../functions';
import { emitAuthStateChange } from '../../store';

const dc = dict.accountSettings;

const toast = createToaster();

export const useUpdateDisplayNameDialogState = (
  initialDisplayName: string,
  dialogIsOpen: boolean,
  closeDialog: () => void,
  user: DeepReadonly<User>
): DeepReadonly<{
  state: UpdateDisplayNamePageState;
  enterClickHandler: () => void;
  inputDisplayNameHandler: (value: string) => void;
  displayNameFormIntent: Intent;
  enterButtonDisabled: boolean;
}> => {
  const [state, dispatch] = useAsyncReducer(
    updateDisplayNamePageStateReducer,
    updateDisplayNamePageInitialState
  );

  // initialize
  useEffect(() => {
    if (dialogIsOpen) {
      dispatch({ type: 'inputDisplayName', payload: initialDisplayName }).catch(
        console.error
      );
    }
  }, [dialogIsOpen, initialDisplayName, dispatch]);

  const alive = useAlive();

  const onSubmit = useCallback(
    async (
      p: DeepReadonly<{
        newDisplayName: string;
        user: DeepReadonly<User>;
        closeDialog: () => void;
      }>
    ): Promise<void> => {
      const s = await dispatch({ type: 'submit' });

      if (updateDisplayNamePageHasError(s)) return;

      const res = await updateDisplayName(p.user, p.newDisplayName);

      if (!alive.current) return;

      if (Result.isErr(res)) {
        console.error(
          'some error occurred on updateDisplayName:',
          res.value.code,
          res.value.message
        );
        await dispatch({ type: 'done' });
        p.closeDialog();
        showToast({
          toast,
          message: dc.updateDisplayName.message.error,
          intent: 'danger',
        });
        return;
      }

      emitAuthStateChange(); // added because onAuthStateChanged doesn't fire on updateProfile

      await dispatch({ type: 'done' });
      p.closeDialog();
      showToast({
        toast,
        message: dc.updateDisplayName.message.success,
        intent: 'success',
      });
    },
    [alive, dispatch]
  );

  const enterButtonDisabled = useMemo(
    () => state.isWaitingResponse || updateDisplayNamePageHasError(state),
    [state]
  );

  const enterClickHandler = useCallback(async () => {
    if (enterButtonDisabled) return;

    await onSubmit({
      newDisplayName: state.displayName.inputValue,
      user,
      closeDialog,
    });
  }, [
    enterButtonDisabled,
    state.displayName.inputValue,
    user,
    closeDialog,
    onSubmit,
  ]);

  const inputDisplayNameHandler = useCallback(
    (value: string) => {
      dispatch({
        type: 'inputDisplayName',
        payload: value,
      }).catch(console.error);
    },
    [dispatch]
  );

  const displayNameFormIntent: Intent =
    state.displayName.error === undefined ? 'primary' : 'danger';

  return {
    state,
    enterClickHandler,
    inputDisplayNameHandler,
    displayNameFormIntent,
    enterButtonDisabled,
  };
};
