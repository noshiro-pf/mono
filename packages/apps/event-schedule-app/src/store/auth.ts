import { Routes } from '../constants';
import { fbAuth } from '../initialize-firebase';
import { clog } from '../utils';
import { Router } from './router';

const { state: fireAuthUser$, setState: setUser } = createState<
  FireAuthUser | undefined
>(undefined);

const useFireAuthUser = (): FireAuthUser | undefined =>
  useObservableValue(fireAuthUser$);

const passwordProviderIncluded$: InitializedObservable<boolean> =
  fireAuthUser$.chain(
    map(
      (user) =>
        user?.providerData.some((p) => p.providerId === 'password') ?? false,
    ),
  );

const usePasswordProviderIncluded = (): boolean =>
  useObservableValue(passwordProviderIncluded$);

const emitAuthStateChange = (): void => {
  setUser(fbAuth.currentUser ?? undefined);
};

fbAuth.onAuthStateChanged((user) => {
  clog('onAuthStateChanged', user);
  setUser(user ?? undefined);
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
  passwordProviderIncluded$,
  useFireAuthUser,
  usePasswordProviderIncluded,
  emitAuthStateChange,
  signOut,
  signOutClick,
} as const;
