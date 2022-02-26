import type { Intent } from '@blueprintjs/core';
import { useStreamValue } from '@noshiro/syncflow-react-hooks';
import { useCallback } from 'react';
import type { RegisterPageState } from '../../functions';
import { RegisterPageStore, router } from '../../store';

export const useRegisterPageState = (): DeepReadonly<{
  state: RegisterPageState;
  enterClickHandler: () => void;
  usernameFormIntent: Intent;
  emailFormIntent: Intent;
  passwordFormIntent: Intent;
  passwordIsOpen: boolean;
  enterButtonDisabled: boolean;
}> => {
  const state = useStreamValue(RegisterPageStore.state$);

  const enterButtonDisabled = useStreamValue(
    RegisterPageStore.enterButtonDisabled$
  );

  const usernameFormIntent: Intent = useStreamValue(
    RegisterPageStore.usernameFormIntent$
  );

  const emailFormIntent: Intent = useStreamValue(
    RegisterPageStore.emailFormIntent$
  );

  const passwordFormIntent: Intent = useStreamValue(
    RegisterPageStore.passwordFormIntent$
  );

  const passwordIsOpen = useStreamValue(RegisterPageStore.passwordIsOpen$);

  const pageToBack = useStreamValue(router.pageToBack$);

  const enterClickHandler = useCallback(async (): Promise<void> => {
    if (enterButtonDisabled) return;

    await RegisterPageStore.submit(pageToBack);
  }, [enterButtonDisabled, pageToBack]);

  return {
    state,
    enterClickHandler,
    usernameFormIntent,
    emailFormIntent,
    passwordFormIntent,
    passwordIsOpen,
    enterButtonDisabled,
  };
};
