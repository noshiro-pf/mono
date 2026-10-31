import type { Backend } from '../repository/index.mjs';
import { createPlanStore } from './plan-store.mjs';
import { createSessionStore } from './session-store.mjs';
import { createThemeStore } from './theme-store.mjs';

// The page's one instance of each store. The factories take what they need, so
// that the tests can build their own.

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

const themeKey = 'life-plan-simulator/theme';

const darkQuery = '(prefers-color-scheme: dark)';

export const themeStore = createThemeStore({
  storage: {
    load: () => {
      try {
        return localStorage.getItem(themeKey) ?? undefined;
      } catch {
        return undefined;
      }
    },
    save: (setting) => {
      try {
        localStorage.setItem(themeKey, setting);
      } catch {
        // Storage may be unavailable (private mode); the system's theme is used
        // next time.
      }
    },
  },
  systemPrefersDark: {
    get: () => globalThis.matchMedia(darkQuery).matches,
    watch: (listener) => {
      const query = globalThis.matchMedia(darkQuery);

      query.addEventListener('change', listener);

      return () => {
        query.removeEventListener('change', listener);
      };
    },
  },
  applyDark: (dark) => {
    document.body.classList.toggle('bp6-dark', dark);
  },
});

export const startStore = (): (() => void) => {
  const stopTheme = themeStore.start();

  const stopPlans = planStore.start();

  return () => {
    stopTheme();

    stopPlans();
  };
};

export const attachBackend = (backend: Backend): (() => void) =>
  sessionStore.attach(backend);
