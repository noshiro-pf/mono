import { createBooleanState } from 'synstate-react-hooks';
import { Optional, Result } from 'ts-data-forge';
import { api } from '../../api/index.mjs';
import { Routes } from '../../constants/index.mjs';
import { createToaster, showToast } from '../../functions/index.mjs';
import { Router } from '../router.mjs';

const dc = dict.register;

const toast = createToaster();

const [
  useGoogleSignInButtonDisabled,
  {
    getSnapshot: getGoogleSignInButtonDisabledStateSnapshot,
    state: googleSignInButtonDisabledState,
    setTrue: disableGoogleSignInButton,
    setFalse: enableGoogleSignInButton,
  },
] = createBooleanState(false);

const googleSignInSubmit = async (
  pageToBack: string | undefined,
): Promise<void> => {
  disableGoogleSignInButton();

  const signInResult = await api.auth.googleSignInWithPopup();

  enableGoogleSignInButton();

  if (Result.isErr(signInResult)) {
    showToast({
      toast,
      message: dc.message.error.unknownErrorOnSignIn,
      intent: 'danger',
    });
  } else {
    showToast({ toast, message: dc.message.success.signIn, intent: 'success' });

    if (pageToBack !== undefined) {
      Router.redirect(pageToBack);
    } else {
      Router.redirect(Routes.routes.createPage);
    }
  }
};

const googleSignInClickHandler = (): void => {
  if (getGoogleSignInButtonDisabledStateSnapshot()) return;

  // TODO: use toast
  googleSignInSubmit(Optional.unwrap(Router.pageToBack$.getSnapshot())).catch(
    console.error,
  );
};

export const GoogleSignInStore = {
  googleSignInButtonDisabledState,
  useGoogleSignInButtonDisabled,
  googleSignInClickHandler,
} as const;
