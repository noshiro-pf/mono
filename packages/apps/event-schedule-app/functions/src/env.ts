import { config } from 'firebase-functions';
import { fillFirebaseConfig } from './types';

export const firebaseConfig = fillFirebaseConfig(config());
