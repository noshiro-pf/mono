import type { FirebaseOptions } from 'firebase/app';

/**
 * Where a development build reaches the Firebase emulators, or `undefined` when
 * it uses the real project.
 *
 * `flag` is `VITE_FIREBASE_EMULATORS`, which `.env.development` sets to `true`;
 * a `.env.development.local` (untracked) or the command line can set it to
 * anything else to use the real project. `firebase.mts` also requires
 * `import.meta.env.DEV`, so a production build never connects.
 *
 * The host is the one the page was opened from rather than `localhost`, so a
 * phone opening the development server by its LAN address reaches the emulators
 * on the same machine. The ports are `firebase.json`'s.
 */
export const emulatorEndpoints = (
  flag: string | undefined,
  hostname: string,
  ports: Readonly<{ auth: number; firestore: number; functions: number }>,
): EmulatorEndpoints | undefined =>
  flag === 'true'
    ? ({
        authUrl: `http://${hostname}:${ports.auth}`,
        firestore: { host: hostname, port: ports.firestore },
        functions: { host: hostname, port: ports.functions },
      } as const)
    : undefined;

export type EmulatorEndpoints = Readonly<{
  /** The URL `connectAuthEmulator` takes. */
  authUrl: string;
  /** The host and port `connectFirestoreEmulator` takes. */
  firestore: Readonly<{ host: string; port: number }>;
  /** The host and port `connectFunctionsEmulator` takes. */
  functions: Readonly<{ host: string; port: number }>;
}>;

/**
 * The project id the emulators run under, and the one the app names to them.
 *
 * firebase-tools treats a `demo-` id as a project that does not exist: it asks
 * the production API for nothing, and a service that is not emulated fails
 * instead of reaching the real `event-schedule-app` project of a developer who
 * is logged in. `emulators` and `check:e2e:emulators` in `package.json` pass it
 * as `--project`, and `firebaseAppOptions` gives it to `initializeApp`, so that
 * the Firestore data and the functions' URLs (`/<project>/<region>/<name>`) are
 * the emulators' own.
 */
export const emulatorProjectId = 'demo-event-schedule-app';

/**
 * What `initializeApp` is given: `config` itself, or, when the app uses the
 * emulators, `config` with `emulatorProjectId` in place of the real project id.
 */
export const firebaseAppOptions = (
  config: Readonly<FirebaseOptions>,
  emulators: EmulatorEndpoints | undefined,
): Readonly<FirebaseOptions> =>
  emulators === undefined
    ? config
    : ({ ...config, projectId: emulatorProjectId } as const);
