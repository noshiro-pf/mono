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
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  setDoc,
  type Firestore,
} from 'firebase/firestore';
import { type DeepReadonly } from 'ts-type-forge';
import { personalProjectDoc, type Backend } from '../repository/index.mjs';
import { firebaseConfig } from './config.mjs';
import { createFirestoreRepository } from './firestore-repository.mjs';

export const createFirebaseBackend = (): Backend => {
  const app = initializeApp(firebaseConfig);

  const auth = getAuth(app);

  const firestore = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });

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
  const project = doc(firestore, 'projects', uid);

  const snapshot = await getDoc(project);

  if (!snapshot.exists()) {
    await setDoc(project, personalProjectDoc(uid, Date.now()));
  }
};
