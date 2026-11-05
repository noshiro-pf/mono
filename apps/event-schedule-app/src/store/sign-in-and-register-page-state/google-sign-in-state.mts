import { type InitializedObservable, createBooleanState } from 'synstate';
import type { Href } from 'synstate-router';
import { Optional, Result } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import { dict, routes } from '../../constants/index.mjs';
import { showToast } from '../../functions/index.mjs';
import type { AppRouter } from '../router-store.mjs';

export type GoogleSignInDeps = Readonly<{
  api: Readonly<{
    auth: Readonly<{
      /** Only whether it went through is read. */
      googleSignInWithPopup: () => Promise<Result<unknown, unknown>>;
    }>;
  }>;
  router: StrictPick<AppRouter, 'pageToBack$' | 'replace'>;
  /** Where the page says whether it went through. */
  toast: Promise<Toaster>;
}>;

/**
 * Signing in with Google, from the sign-in or the register page, and going back
 * to the page signing in was asked from.
 */
export const createGoogleSignInStore = (
  deps: GoogleSignInDeps,
): GoogleSignIn => {
  const dc = dict.register;

  const [
    googleSignInButtonDisabledState,
    {
      getSnapshot: getGoogleSignInButtonDisabledStateSnapshot,

      setTrue: disableGoogleSignInButton,
      setFalse: enableGoogleSignInButton,
    },
  ] = createBooleanState(false);

  const googleSignInSubmit = async (
    pageToBack: Href | undefined,
  ): Promise<void> => {
    disableGoogleSignInButton();

    const signInResult = await deps.api.auth.googleSignInWithPopup();

    enableGoogleSignInButton();

    if (Result.isErr(signInResult)) {
      showToast({
        toast: deps.toast,
        message: dc.message.error.unknownErrorOnSignIn,
        intent: 'danger',
      });
    } else {
      showToast({
        toast: deps.toast,
        message: dc.message.success.signIn,
        intent: 'success',
      });

      if (pageToBack !== undefined) {
        deps.router.replace(pageToBack);
      } else {
        deps.router.replace(routes.create.href());
      }
    }
  };

  const googleSignInClickHandler = (): void => {
    if (getGoogleSignInButtonDisabledStateSnapshot()) {
      return;
    }

    // TODO: use toast
    googleSignInSubmit(
      Optional.unwrap(deps.router.pageToBack$.getSnapshot()),
    ).catch(console.error);
  };

  return {
    googleSignInButtonDisabledState,
    googleSignInClickHandler,
  } as const;
};

export type GoogleSignIn = Readonly<{
  /** Whether a Google sign-in is under way. */
  googleSignInButtonDisabledState: InitializedObservable<boolean>;
  googleSignInClickHandler: () => void;
}>;
