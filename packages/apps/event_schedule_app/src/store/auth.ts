import { createState } from '@noshiro/syncflow';
import { useStreamValue } from '@noshiro/syncflow-react-hooks';
import type { User } from 'firebase/auth';
import { routes } from '../constants';
import { auth } from '../initialize-firebase';
import { clog } from '../utils';
import { router } from './router';

const [user$, setUser] = createState<DeepReadonly<User> | undefined>(undefined);
export { user$ };

export const useUser = (): DeepReadonly<User> | undefined =>
  useStreamValue(user$);

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
