import { config } from 'firebase-functions';
import { fillFirebaseConfig } from './types/index.mjs';

export const firebaseConfig = fillFirebaseConfig(config());
