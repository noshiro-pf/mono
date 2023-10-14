import { type FirebaseError } from 'firebase/app';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { fbAuth, googleAuthProvider } from '../../initialize-firebase';

export const googleSignInWithPopup = (): Promise<
  Result<OAuthCredential | undefined, OAuthCredential | undefined>
> =>
  Result.fromPromise(signInWithPopup(fbAuth, googleAuthProvider)).then((a) =>
    Result.fold(
      a,
      (result: UserCredential) =>
        // This gives you a Google Access Token. You can use it to access the Google API.
        GoogleAuthProvider.credentialFromResult(castDeepWritable(result)) ??
        undefined,
      (error) =>
        // The AuthCredential type that was used.
        // eslint-disable-next-line no-restricted-syntax
        GoogleAuthProvider.credentialFromError(error as FirebaseError) ??
        undefined,
    ),
  );
