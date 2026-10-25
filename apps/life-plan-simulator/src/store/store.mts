import type { Backend } from '../repository/index.mjs';
import { createPlanStore } from './plan-store.mjs';
import { createSessionStore } from './session-store.mjs';

// The page's one instance of each store. The factories take what they need,
// so that the tests can build their own.

export const sessionStore = createSessionStore();

/**
 * Only which plan was open last is kept in this browser's localStorage; the
 * plans themselves are in the repository.
 */
const selectionKey = 'life-plan-simulator/selected-plan';

export const planStore = createPlanStore({
  session: sessionStore.session,
  now: () => Date.now(),
  selection: {
    load: () => {
      try {
        return localStorage.getItem(selectionKey) ?? undefined;
      } catch {
        return undefined;
      }
    },
    save: (id) => {
      try {
        localStorage.setItem(selectionKey, id);
      } catch {
        // Storage may be unavailable (private mode); the first plan opens.
      }
    },
  },
  reportError: (message, error) => {
    console.error(message, error);
  },
});

export const startStore = (): (() => void) => planStore.start();

export const attachBackend = (backend: Backend): (() => void) =>
  sessionStore.attach(backend);
