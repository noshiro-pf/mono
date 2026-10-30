import { type InitializedObservable, map } from 'synstate';
import { createState, useObservableValue } from 'synstate-react-hooks';
import { api } from '../api/index.mjs';
import { Routes } from '../constants/index.mjs';
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
  setFireAuthUser(api.auth.currentUser());
};

api.auth.onAuthStateChanged((user) => {
  clog('onAuthStateChanged', user);

  setFireAuthUser(user);
});

const signOut = async (): Promise<void> => {
  await api.auth.signOut();

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
