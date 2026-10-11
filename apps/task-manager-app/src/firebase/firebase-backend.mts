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
  connectFirestoreEmulator,
  doc,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import type { DeepReadonly } from 'ts-type-forge';
import firebaseJson from '../../firebase.json' with { type: 'json' };
import { getDocData, putDoc, type DocTarget } from '../api/index.mjs';
import {
  personalProjectDoc,
  ProjectDocCodec,
  type Backend,
  type ProjectDoc,
} from '../repository/index.mjs';
import { emulatorEndpoints } from '../view-model/index.mjs';
import { firebaseConfig } from './config.mjs';
import { createFirestoreRepository } from './firestore-repository.mjs';

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

  const auth = getAuth(app);

  const firestore = initializeFirestore(app, {
    localCache:
      emulators === undefined
        ? persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          })
        : memoryLocalCache(),
  });

  if (emulators !== undefined) {
    connectAuthEmulator(auth, emulators.authUrl, { disableWarnings: true });

    connectFirestoreEmulator(
      firestore,
      emulators.firestore.host,
      emulators.firestore.port,
    );

    console.info('Using the Firebase emulators', emulators);
  }

  return {
    watchSession: (listener) => {
      // A sign-out while the project is still being set up must not be
      // followed by the signed-in session that set-up finishes with.
      let mut_generation = 0;

      return onAuthStateChanged(auth, (user) => {
        mut_generation += 1;

        if (user === null) {
          listener({ type: 'signed-out' });

          return;
        }

        const generation = mut_generation;

        ensurePersonalProject(firestore, user.uid)
          .catch((error: unknown) => {
            // Offline on the very first sign-in, or the rules not deployed:
            // the listeners report what this means for the data.
            console.warn('Could not set up the personal project', error);
          })
          .finally(() => {
            if (generation === mut_generation) {
              listener({
                type: 'signed-in',
                userName: user.displayName ?? user.email ?? 'サインイン中',
                repository: createFirestoreRepository(firestore, user.uid),
              });
            }
          });
      });
    },
    signIn: async () => {
      await signInWithPopup(auth, new GoogleAuthProvider());
    },
    signOut: () => signOut(auth),
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
