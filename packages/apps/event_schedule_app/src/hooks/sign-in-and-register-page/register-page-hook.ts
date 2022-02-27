import type { Intent } from '@blueprintjs/core';
import { useStreamValue } from '@noshiro/syncflow-react-hooks';
import { useCallback, useState } from 'react';
import { googleSignInWithPopup } from '../../api';
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
  googleSignInButtonDisabled: boolean;
  googleSignInClickHandler: () => void;
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

  // TODO: store に移す
  const [googleSignInButtonDisabled, setGoogleSignInButtonDisabled] =
    useState<boolean>(false);

  const enterClickHandler = useCallback(async (): Promise<void> => {
    if (enterButtonDisabled || googleSignInButtonDisabled) return;

    await RegisterPageStore.submit(pageToBack);
  }, [enterButtonDisabled, googleSignInButtonDisabled, pageToBack]);

  // TODO: store にロジックを移す
  const googleSignInClickHandler = useCallback(async () => {
    if (googleSignInButtonDisabled) return;

    setGoogleSignInButtonDisabled(true);
    await googleSignInWithPopup();
    setGoogleSignInButtonDisabled(false);
  }, [googleSignInButtonDisabled]);

  return {
    state,
    enterClickHandler,
    usernameFormIntent,
    emailFormIntent,
    passwordFormIntent,
    passwordIsOpen,
    enterButtonDisabled,
    googleSignInButtonDisabled,
    googleSignInClickHandler,
  };
};
