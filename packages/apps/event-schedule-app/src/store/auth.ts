import { Routes } from '../constants';
import { fbAuth } from '../initialize-firebase';
import { clog } from '../utils';
import { Router } from './router';

const {
  state: fireAuthUser$,
  setState: setFireAuthUser,
  getSnapshot: getFireAuthUserSnapshot,
  useCurrentValue: useFireAuthUser,
} = createState<FireAuthUser | undefined>(undefined);

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
