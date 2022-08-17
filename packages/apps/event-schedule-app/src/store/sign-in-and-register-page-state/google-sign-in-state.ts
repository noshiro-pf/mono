import { api } from '../../api';
import { Routes } from '../../constants';
import { createToaster, showToast } from '../../functions';
import { router } from '../router';

const dc = dict.register;

const toast = createToaster();

export namespace GoogleSignInStore {
  export const {
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

  const mut_subscribedValues: {
    googleSignInButtonDisabled: boolean;
    pageToBack: string | undefined;
  } = {
    googleSignInButtonDisabled: true,
    pageToBack: undefined,
  };

  googleSignInButtonDisabled$.subscribe((v) => {
    mut_subscribedValues.googleSignInButtonDisabled = v;
  });

  router.pageToBack$.subscribe((v) => {
    mut_subscribedValues.pageToBack = v;
  });

  export const googleSignInClickHandler = (): void => {
    if (mut_subscribedValues.googleSignInButtonDisabled) return;

    // TODO: use toast
    googleSignInSubmit(mut_subscribedValues.pageToBack).catch(console.error);
  };
}
