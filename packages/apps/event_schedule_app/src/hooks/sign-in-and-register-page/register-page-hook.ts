import type { Intent } from '@blueprintjs/core';
import { useObservableValue } from '@noshiro/syncflow-react-hooks';
import { useCallback } from 'react';
import type { RegisterPageState } from '../../functions';
import { RegisterPageStore, router } from '../../store';
import { useGoogleSignInState } from './google-sign-in-hook';

export const useRegisterPageState = (): DeepReadonly<{
  formState: RegisterPageState;
  enterClickHandler: () => void;
  usernameFormIntent: Intent;
  emailFormIntent: Intent;
  passwordFormIntent: Intent;
  passwordIsOpen: boolean;
  enterButtonDisabled: boolean;
  googleSignInButtonDisabled: boolean;
  googleSignInClickHandler: () => void;
}> => {
  const { googleSignInButtonDisabled, googleSignInClickHandler } =
    useGoogleSignInState();

  const {
    formState,
    enterButtonDisabled,
    usernameFormIntent,
    emailFormIntent,
    passwordFormIntent,
    passwordIsOpen,
  } = useObservableValue(RegisterPageStore.state$);

  const pageToBack = useObservableValue(router.pageToBack$);

  const enterClickHandler = useCallback(async (): Promise<void> => {
    if (enterButtonDisabled || googleSignInButtonDisabled) return;

    await RegisterPageStore.submit(pageToBack);
  }, [enterButtonDisabled, googleSignInButtonDisabled, pageToBack]);

  return {
    formState,
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
