import { EmailAuthProvider } from 'firebase/auth';
import type { FirebaseHandles } from '../firebase.mjs';

/** Calls `listener` with the signed-in user on every change; returns what stops it. */
export const onAuthStateChanged =
  ({ fbAuth }: FirebaseHandles) =>
  (listener: (user: FireAuthUser | undefined) => void): (() => void) =>
    fbAuth.onAuthStateChanged((user) => {
      listener(user ?? undefined);
    });

/** The signed-in user now. */
export const currentUser =
  ({ fbAuth }: FirebaseHandles) =>
  (): FireAuthUser | undefined =>
    fbAuth.currentUser ?? undefined;

export const signOut =
  ({ fbAuth }: FirebaseHandles) =>
  (): Promise<void> =>
    fbAuth.signOut();

/** A credential to re-authenticate the user who signed in with this email and password. */
export const emailCredential = (
  email: string,
  password: string,
): AuthCredential => EmailAuthProvider.credential(email, password);
