import type { FirebaseError } from 'firebase/app';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../../initialize-firebase';
import type { OAuthCredential, UserCredential } from '../../types';

export const googleSignInWithPopup = (): Promise<
  Result<OAuthCredential | undefined, OAuthCredential | undefined>
> =>
  Result.fromPromise(signInWithPopup(auth, googleAuthProvider)).then(
    Result.fold(
      (result: UserCredential) =>
        // This gives you a Google Access Token. You can use it to access the Google API.
        GoogleAuthProvider.credentialFromResult(castWritable(result)) ??
        undefined,
      (error) =>
        // The AuthCredential type that was used.
        GoogleAuthProvider.credentialFromError(error as FirebaseError) ??
        undefined
    )
  );
