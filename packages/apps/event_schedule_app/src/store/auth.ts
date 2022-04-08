import type { User } from 'firebase/auth';
import { routes } from '../constants';
import { auth } from '../initialize-firebase';
import { clog } from '../utils';
import { router } from './router';

const { state$: user$, setState: setUser } = createState<
  DeepReadonly<User> | undefined
>(undefined);
export { user$ };

export const useUser = (): DeepReadonly<User> | undefined =>
  useObservableValue(user$);

export const passwordProviderIncluded$: InitializedObservable<boolean> =
  user$.chain(
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
  signOut().catch(console.error);
};
