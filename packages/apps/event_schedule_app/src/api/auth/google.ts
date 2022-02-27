import type { FirebaseError } from 'firebase/app';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../../initialize-firebase';

export const googleSignInWithPopup = (): Promise<void> =>
  signInWithPopup(auth, googleAuthProvider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      // The signed-in user info.
      console.log(token, result);
    })
    .catch((error) => {
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(
        error as FirebaseError
      );
      console.log(error, credential);
    });
