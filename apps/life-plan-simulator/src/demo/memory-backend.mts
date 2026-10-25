/**
 * The {@link Backend} of the in-memory demo (`?storage=memory`, development
 * builds only): signed in from the start as a demo user, with one plan of
 * the default inputs in memory. Signing out and in again keeps the plans;
 * reloading the page starts over.
 */

import { createState } from 'synstate';
import { defaultSimulationInput } from '../domain/index.mjs';
import {
  createMemoryRepository,
  type Backend,
  type BackendSession,
} from '../repository/index.mjs';

export const createMemoryBackend = (now: number): Backend => {
  const signedIn: BackendSession = {
    type: 'signed-in',
    userName: 'デモ',
    repository: createMemoryRepository([
      {
        id: 'demo',
        name: 'プラン 1',
        createdAt: now,
        updatedAt: now,
        input: defaultSimulationInput,
      },
    ]),
  } as const;

  const [session, setSession] = createState<BackendSession>(signedIn);

  return {
    watchSession: (listener) => {
      const subscription = session.subscribe(listener);

      return () => {
        subscription.unsubscribe();
      };
    },
    signIn: () => {
      setSession(signedIn);

      return Promise.resolve();
    },
    signOut: () => {
      setSession({ type: 'signed-out' });

      return Promise.resolve('signed-out');
    },
  };
};
