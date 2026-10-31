/**
 * Where a development build reaches the Firebase emulators, or `undefined` when
 * it uses the real project.
 *
 * `flag` is `VITE_FIREBASE_EMULATORS`, which `.env.development` sets to `true`;
 * a `.env.development.local` (untracked) or the command line can set it to
 * anything else to use the real project. `firebase-backend.mts` also requires
 * `import.meta.env.DEV`, so a production build never connects.
 *
 * The host is the one the page was opened from rather than `localhost`, so a
 * phone opening the development server by its LAN address reaches the emulators
 * on the same machine. The ports are `firebase.json`'s.
 */
export const emulatorEndpoints = (
  flag: string | undefined,
  hostname: string,
  ports: Readonly<{ auth: number; firestore: number }>,
): EmulatorEndpoints | undefined =>
  flag === 'true'
    ? ({
        authUrl: `http://${hostname}:${ports.auth}`,
        firestore: { host: hostname, port: ports.firestore },
      } as const)
    : undefined;

export type EmulatorEndpoints = Readonly<{
  /** The URL `connectAuthEmulator` takes. */
  authUrl: string;
  /** The host and port `connectFirestoreEmulator` takes. */
  firestore: Readonly<{ host: string; port: number }>;
}>;
