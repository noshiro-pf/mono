import type { Intent } from '@blueprintjs/core';
import { useStreamValue } from '@noshiro/syncflow-react-hooks';
import type { User } from 'firebase/auth';
import { useCallback } from 'react';
import type { UpdateDisplayNamePageState } from '../../functions';
import { UpdateDisplayNamePage } from '../../store';

export const useUpdateDisplayNameDialogState = (
  user: DeepReadonly<User>
): DeepReadonly<{
  state: UpdateDisplayNamePageState;
  enterClickHandler: () => void;
  displayNameFormIntent: Intent;
  enterButtonDisabled: boolean;
}> => {
  const state = useStreamValue(UpdateDisplayNamePage.state$);

  const enterButtonDisabled = useStreamValue(
    UpdateDisplayNamePage.enterButtonDisabled$
  );

  const displayNameFormIntent: Intent = useStreamValue(
    UpdateDisplayNamePage.displayNameFormIntent$
  );

  const enterClickHandler = useCallback(async () => {
    if (enterButtonDisabled) return;

    await UpdateDisplayNamePage.submit({
      newDisplayName: state.displayName.inputValue,
      user,
    });
  }, [state, enterButtonDisabled, user]);

  return {
    state,
    enterClickHandler,
    displayNameFormIntent,
    enterButtonDisabled,
  };
};
