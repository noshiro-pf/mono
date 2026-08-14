import { type InitializedObservable, map } from 'synstate';
import { createState, useObservableValue } from 'synstate-react-hooks';
import { Routes } from '../constants/index.mjs';
import { fbAuth } from '../initialize-firebase.mjs';
import { clog } from '../utils/index.mjs';
import { Router } from './router.mjs';

const [
  useFireAuthUser,
  setFireAuthUser,
  { state: fireAuthUser$, getSnapshot: getFireAuthUserSnapshot },
] = createState<FireAuthUser | undefined>(undefined);

const passwordProviderIncluded$: InitializedObservable<boolean> =
  fireAuthUser$.pipe(
    map(
      (user) =>
        user?.providerData.some((p) => p.providerId === 'password') ?? false,
    ),
  );

const usePasswordProviderIncluded = (): boolean =>
  useObservableValue(passwordProviderIncluded$);

const emitAuthStateChange = (): void => {
  setFireAuthUser(fbAuth.currentUser ?? undefined);
};

fbAuth.onAuthStateChanged((user) => {
  clog('onAuthStateChanged', user);

  setFireAuthUser(user ?? undefined);
});

const signOut = async (): Promise<void> => {
  await fbAuth.signOut();

  Router.push(Routes.routes.signInPage);
};

const signOutClick = (): void => {
  // TODO: use toast
  signOut().catch(console.error);
};

export const Auth = {
  fireAuthUser$,
  getFireAuthUserSnapshot,
  passwordProviderIncluded$,
  useFireAuthUser,
  usePasswordProviderIncluded,
  emitAuthStateChange,
  signOut,
  signOutClick,
} as const;
