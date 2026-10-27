/**
 * Vite's ambient types: `import.meta.env`, which `main.tsx` reads for `DEV`,
 * and the side-effect import of `./index.css`; and the variables this app
 * reads from `.env.*`.
 */
/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** `true` to use the Firebase emulators (`emulator-mode.mts`). */
  readonly VITE_FIREBASE_EMULATORS?: string;
}
