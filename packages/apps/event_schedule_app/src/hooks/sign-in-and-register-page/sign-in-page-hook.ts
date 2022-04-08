import type { Intent } from '@blueprintjs/core';
import type { SignInPageState } from '../../functions';
import { router, SignInPageStore } from '../../store';
import { useGoogleSignInState } from './google-sign-in-hook';

export const useSignInPageState = (): DeepReadonly<{
  formState: SignInPageState;
  enterClickHandler: () => void;
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
    emailFormIntent,
    passwordFormIntent,
    passwordIsOpen,
  } = useObservableValue(SignInPageStore.state$);

  const pageToBack = useObservableValue(router.pageToBack$);

  const enterClickHandler = useCallback(() => {
    if (enterButtonDisabled || googleSignInButtonDisabled) return;

    SignInPageStore.submit(pageToBack).catch(console.error);
  }, [enterButtonDisabled, googleSignInButtonDisabled, pageToBack]);

  return {
    formState,
    enterClickHandler,
    emailFormIntent,
    passwordFormIntent,
    passwordIsOpen,
    enterButtonDisabled,
    googleSignInButtonDisabled,
    googleSignInClickHandler,
  };
};
