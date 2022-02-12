import type { Intent } from '@blueprintjs/core';
import { useStreamValue } from '@noshiro/syncflow-react-hooks';
import { useCallback } from 'react';
import type { SignInPageState } from '../../functions';
import { router, SignInPageStore } from '../../store';

export const useSignInPageState = (): DeepReadonly<{
  state: SignInPageState;
  enterClickHandler: () => void;
  emailFormIntent: Intent;
  passwordFormIntent: Intent;
  passwordIsOpen: boolean;
  enterButtonDisabled: boolean;
}> => {
  const state = useStreamValue(SignInPageStore.state$);

  const enterButtonDisabled = useStreamValue(
    SignInPageStore.enterButtonDisabled$
  );

  const emailFormIntent: Intent = useStreamValue(
    SignInPageStore.emailFormIntent$
  );

  const passwordFormIntent: Intent = useStreamValue(
    SignInPageStore.passwordFormIntent$
  );

  const passwordIsOpen = useStreamValue(SignInPageStore.passwordIsOpen$);

  const pageToBack = useStreamValue(router.pageToBack$);

  const enterClickHandler = useCallback(async () => {
    if (enterButtonDisabled) return;

    await SignInPageStore.submit(pageToBack);
  }, [enterButtonDisabled, pageToBack]);

  return {
    state,
    enterClickHandler,
    emailFormIntent,
    passwordFormIntent,
    passwordIsOpen,
    enterButtonDisabled,
  };
};
