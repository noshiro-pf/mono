import { createApi } from './create-api.mjs';
import { initializeFirebase } from './firebase.mjs';

/**
 * The app's one connection to Firebase, made when this module is first
 * imported. The stores import it until each of them is made by a factory that
 * takes an `Api` (#2094); then it moves to where the stores are made.
 */
export const api = createApi(initializeFirebase());
