import type { Intent } from '@blueprintjs/core';
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

  const enterClickHandler = useCallback(() => {
    if (enterButtonDisabled || googleSignInButtonDisabled) return;

    RegisterPageStore.submit(pageToBack).catch(console.error);
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
