import { routes } from '../constants';
import { auth } from '../initialize-firebase';
import { clog } from '../utils';
import { router } from './router';

const { state$: fireAuthUser$, setState: setUser } = createState<
  FireAuthUser | undefined
>(undefined);

export { fireAuthUser$ };

export const useFireAuthUser = (): FireAuthUser | undefined =>
  useObservableValue(fireAuthUser$);

export const passwordProviderIncluded$: InitializedObservable<boolean> =
  fireAuthUser$.chain(
    mapI(
      (user) =>
        user?.providerData.some((p) => p.providerId === 'password') ?? false
    )
  );

export const usePasswordProviderIncluded = (): boolean =>
  useObservableValue(passwordProviderIncluded$);

export const emitAuthStateChange = (): void => {
  setUser(auth.currentUser ?? undefined);
};

auth.onAuthStateChanged((user) => {
  clog('onAuthStateChanged', user);
  setUser(user ?? undefined);
});

export const signOut = async (): Promise<void> => {
  await auth.signOut();
  router.push(routes.signInPage);
};

export const signOutClick = (): void => {
  // TODO: use toast
  signOut().catch(console.error);
};
