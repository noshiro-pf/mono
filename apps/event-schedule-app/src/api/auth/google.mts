import { type FirebaseError } from 'firebase/app';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Result, castDeepMutable } from 'ts-data-forge';
import { fbAuth, googleAuthProvider } from '../../initialize-firebase.mjs';

export const googleSignInWithPopup = (): Promise<
  Result<OAuthCredential | undefined, OAuthCredential | undefined>
> =>
  Result.fromPromise(signInWithPopup(fbAuth, googleAuthProvider)).then(
    Result.fold(
      (result: UserCredential) =>
        // This gives you a Google Access Token. You can use it to access the Google API.
        GoogleAuthProvider.credentialFromResult(castDeepMutable(result)) ??
        undefined,
      (error) =>
        // The AuthCredential type that was used.
        GoogleAuthProvider.credentialFromError(
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          error as FirebaseError,
        ) ?? undefined,
    ),
  );
