import type { Intent } from '@blueprintjs/core';
import { useStreamValue } from '@noshiro/syncflow-react-hooks';
import { useCallback } from 'react';
import type { ResetPasswordPageState } from '../../functions';
import { ResetPasswordPageStore, router } from '../../store';

export const useResetPasswordPageState = (): DeepReadonly<{
  state: ResetPasswordPageState;
  enterClickHandler: () => void;
  emailFormIntent: Intent;
  enterButtonDisabled: boolean;
}> => {
  const state = useStreamValue(ResetPasswordPageStore.state$);

  const enterButtonDisabled = useStreamValue(
    ResetPasswordPageStore.enterButtonDisabled$
  );

  const emailFormIntent: Intent = useStreamValue(
    ResetPasswordPageStore.emailFormIntent$
  );

  const pageToBack = useStreamValue(router.pageToBack$);

  const enterClickHandler = useCallback(async (): Promise<void> => {
    if (enterButtonDisabled) return;

    await ResetPasswordPageStore.submit(pageToBack);
  }, [enterButtonDisabled, pageToBack]);

  return {
    state,
    enterClickHandler,
    emailFormIntent,
    enterButtonDisabled,
  };
};
