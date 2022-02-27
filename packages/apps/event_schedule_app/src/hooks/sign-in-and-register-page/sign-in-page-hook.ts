import type { Intent } from '@blueprintjs/core';
import { useStreamValue } from '@noshiro/syncflow-react-hooks';
import { useCallback, useState } from 'react';
import { googleSignInWithPopup } from '../../api';
import type { SignInPageState } from '../../functions';
import { router, SignInPageStore } from '../../store';

export const useSignInPageState = (): DeepReadonly<{
  state: SignInPageState;
  enterClickHandler: () => void;
  emailFormIntent: Intent;
  passwordFormIntent: Intent;
  passwordIsOpen: boolean;
  enterButtonDisabled: boolean;
  googleSignInButtonDisabled: boolean;
  googleSignInClickHandler: () => void;
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

  // TODO: store に移す
  const [googleSignInButtonDisabled, setGoogleSignInButtonDisabled] =
    useState<boolean>(false);

  const enterClickHandler = useCallback(async () => {
    if (enterButtonDisabled || googleSignInButtonDisabled) return;

    await SignInPageStore.submit(pageToBack);
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
    emailFormIntent,
    passwordFormIntent,
    passwordIsOpen,
    enterButtonDisabled,
    googleSignInButtonDisabled,
    googleSignInClickHandler,
  };
};
