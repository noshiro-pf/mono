import { api } from '../../api';
import { Routes } from '../../constants';
import { createToaster, showToast } from '../../functions';
import { router } from '../router';

const dc = dict.register;

const toast = createToaster();

const {
  state$: googleSignInButtonDisabled$,
  setTrue: disableGoogleSignInButton,
  setFalse: enableGoogleSignInButton,
} = createBooleanState(false);

const googleSignInSubmit = async (
  pageToBack: string | undefined
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
    showToast({
      toast,
      message: dc.message.success.signIn,
      intent: 'success',
    });

    if (pageToBack !== undefined) {
      router.redirect(pageToBack);
    } else {
      router.redirect(Routes.routes.createPage);
    }
  }
};

const googleSignInClickHandler = (): void => {
  if (googleSignInButtonDisabled$.snapshot.value) return;

  // TODO: use toast
  googleSignInSubmit(Maybe.unwrap(router.pageToBack$.snapshot)).catch(
    console.error
  );
};

export const GoogleSignInStore = {
  googleSignInButtonDisabled$,
  googleSignInClickHandler,
} as const;
