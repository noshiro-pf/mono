import type { FirebaseError } from 'firebase/app';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Result, castDeepMutable } from 'ts-data-forge';
import type { FirebaseHandles } from '../firebase.mjs';

export const googleSignInWithPopup =
  ({ fbAuth, googleAuthProvider }: FirebaseHandles) =>
  (): Promise<
    Result<OAuthCredential | undefined, OAuthCredential | undefined>
  > =>
    Result.fromPromise(
      signInWithPopup(castDeepMutable(fbAuth), googleAuthProvider),
    ).then(
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
