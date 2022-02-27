import { createBooleanState } from '@noshiro/syncflow';
import { Result } from '@noshiro/ts-utils';
import { api } from '../../api';
import { dict, routes } from '../../constants';
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

  export const googleSignInSubmit = async (
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
        router.redirect(routes.createPage);
      }
    }
  };
}
