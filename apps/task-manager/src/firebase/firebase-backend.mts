/**
 * The {@link Backend} of the published app: Google sign-in with Firebase
 * Auth, and each user's personal project in Cloud Firestore.
 *
 * **A popup, never a redirect.** The page is served from
 * `noshiro-pf.github.io` and the auth domain is `firebaseapp.com`; a
 * redirect sign-in hands its result back through storage on the auth
 * domain, which Safari's storage partitioning (and so every browser on iOS)
 * keeps from the page, and the sign-in silently does nothing.
 *
 * **Offline**: Firestore keeps its cache in IndexedDB, shared between tabs,
 * so the data opens without a network and writes made offline are sent
 * when it is back.
 *
 * **Signing out deletes that cache**, which would otherwise leave the data
 * readable on a shared device. An instance can delete its cache only once
 * it has been terminated, and a terminated one cannot be used again, so
 * every sign-out — here, in another tab, or the one a page starts with —
 * terminates the instance, deletes the cache and starts a new one, which a
 * sign-in waits for. Another tab still holding the cache terminates its own
 * instance when asked to delete it.
 *
 * **Emulators**: a development build connects Auth and Firestore to the
 * local emulators unless told otherwise (`emulator-mode.mts`). It then keeps
 * the Firestore cache in memory: the IndexedDB cache is keyed by project,
 * not by server, so the emulator's data and the real project's, both opened
 * from `localhost`, would otherwise share one cache.
 */

import { initializeApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  clearIndexedDbPersistence,
  connectFirestoreEmulator,
  doc,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager,
  terminate,
  waitForPendingWrites,
  type Firestore,
} from 'firebase/firestore';
import type { DeepReadonly } from 'ts-type-forge';
import firebaseJson from '../../firebase.json' with { type: 'json' };
import { getDocData, putDoc, type DocTarget } from '../api/index.mjs';
import { lang, m } from '../i18n/index.mjs';
import {
  personalProjectDoc,
  ProjectDocCodec,
  type Backend,
  type ProjectDoc,
} from '../repository/index.mjs';
import { emulatorEndpoints } from '../view-model/index.mjs';
import { firebaseConfig } from './config.mjs';
import { createFirestoreRepository } from './firestore-repository.mjs';

/**
 * How long a sign-out waits for the writes made offline to be sent.
 * `waitForPendingWrites` never settles while offline.
 */
const PENDING_WRITES_TIMEOUT_MS = 5000;

export const createFirebaseBackend = (): Backend => {
  const app = initializeApp(firebaseConfig);

  const emulators = import.meta.env.DEV
    ? emulatorEndpoints(
        import.meta.env.VITE_FIREBASE_EMULATORS,
        document.location.hostname,
        {
          auth: firebaseJson.emulators.auth.port,
          firestore: firebaseJson.emulators.firestore.port,
        },
      )
    : undefined;

  const mut_auth = getAuth(app);

  // Google's sign-in page, and Firebase's own messages, in the page's
  // language; Firebase takes it only as a property.
  mut_auth.languageCode = lang;

  const auth = mut_auth;

  if (emulators !== undefined) {
    connectAuthEmulator(auth, emulators.authUrl, { disableWarnings: true });

    console.info('Using the Firebase emulators', emulators);
  }

  const createFirestore = (): Firestore => {
    const firestore = initializeFirestore(app, {
      localCache:
        emulators === undefined
          ? persistentLocalCache({
              tabManager: persistentMultipleTabManager(),
            })
          : memoryLocalCache(),
    });

    if (emulators !== undefined) {
      connectFirestoreEmulator(
        firestore,
        emulators.firestore.host,
        emulators.firestore.port,
      );
    }

    return firestore;
  };

  const deleteCache = async (
    firestore: DeepReadonly<Firestore>,
  ): Promise<void> => {
    await terminate(firestore);

    if (emulators === undefined) {
      await clearIndexedDbPersistence(firestore);
    }
  };

  /** Replaced, once its cache is deleted, on every sign-out. */
  let mut_firestore: Promise<Firestore> = Promise.resolve(createFirestore());

  return {
    watchSession: (listener) => {
      // A sign-out while the project is still being set up must not be
      // followed by the signed-in session that set-up finishes with.
      let mut_generation = 0;

      return onAuthStateChanged(auth, (user) => {
        mut_generation += 1;

        if (user === null) {
          listener({ type: 'signed-out' });

          mut_firestore = mut_firestore
            .then(deleteCache)
            .catch((error: unknown) => {
              console.warn('Could not delete the Firestore cache', error);
            })
            .then(createFirestore);

          return;
        }

        const generation = mut_generation;

        mut_firestore
          .then(async (firestore) => {
            await ensurePersonalProject(firestore, user.uid);

            return firestore;
          })
          .catch((error: unknown) => {
            // Offline on the very first sign-in, or the rules not deployed:
            // the listeners report what this means for the data.
            console.warn('Could not set up the personal project', error);

            return mut_firestore;
          })
          .then((firestore) => {
            if (generation === mut_generation) {
              listener({
                type: 'signed-in',
                userName:
                  user.displayName ?? user.email ?? m.header.signedInFallback,
                repository: createFirestoreRepository(firestore, user.uid),
              });
            }
          })
          .catch((error: unknown) => {
            console.error('Could not start Firestore', error);
          });
      });
    },
    signIn: async () => {
      await signInWithPopup(auth, new GoogleAuthProvider());
    },
    signOut: async ({ discardUnsentWrites }) => {
      if (
        !discardUnsentWrites &&
        !(await settlesWithin(
          waitForPendingWrites(await mut_firestore),
          PENDING_WRITES_TIMEOUT_MS,
        ))
      ) {
        return 'unsent-writes';
      }

      await signOut(auth);

      return 'signed-out';
    },
  };
};

/**
 * Creates `projects/{uid}` on a user's first sign-in. The rules let a user
 * read that one document before it exists, and create it only for their own
 * uid, as its owner and only member.
 */
const ensurePersonalProject = async (
  firestore: DeepReadonly<Firestore>,
  uid: string,
): Promise<void> => {
  const project: DocTarget<ProjectDoc> = {
    ref: doc(firestore, 'projects', uid),
    codec: ProjectDocCodec,
  } as const;

  if ((await getDocData(project.ref)) === undefined) {
    await putDoc(project, personalProjectDoc(uid, Date.now()));
  }
};

/** Whether `promise` resolves within `ms`; a rejection is thrown. */
const settlesWithin = (
  promise: Promise<unknown>,
  ms: number,
): Promise<boolean> =>
  Promise.race([
    promise.then(() => true),
    new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(false);
      }, ms);
    }),
  ]);
