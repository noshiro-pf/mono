import { defineJsonSecret } from 'firebase-functions/params';
import { fillFirebaseConfig, type FirebaseConfig } from './types/index.mjs';

/**
 * What `functions.config()` used to hold, which firebase-functions v7 removed.
 * `firebase functions:config:export` copies the old runtime config into this
 * secret unchanged, so the shape is still `{ gmail: { … } }`.
 *
 * A secret is readable only while a function bound to it runs (`runWith({
 * secrets })` in `index.mts`), not when the module loads — deploy loads it to
 * discover the functions — so it is read on each call rather than once here.
 */
export const runtimeConfig = defineJsonSecret<unknown>('RUNTIME_CONFIG');

export const getFirebaseConfig = (): FirebaseConfig =>
  fillFirebaseConfig(runtimeConfig.value());
