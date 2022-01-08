import { createState } from '@noshiro/syncflow';
import { routes } from '../constants';
import { auth } from '../initialize-firebase';
import { router } from './router';

export const [user$, setUser] = createState<UserSummary | undefined>(undefined);

export type UserSummary = DeepReadonly<{
  id: string;
  name: string;
  email: string;
}>;

auth.onAuthStateChanged((user) => {
  setUser(
    user === null || user.displayName === null || user.email === null
      ? undefined
      : {
          id: user.uid,
          name: user.displayName,
          email: user.email,
        }
  );
});

export const signOut = async (): Promise<void> => {
  await auth.signOut();
  router.push(routes.signInPage);
};
