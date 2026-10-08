import { logger } from 'firebase-functions/v1';
import { Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';

const firebaseConfigTypeDef = t.record({
  gmail: t.record({
    email: t.string(''),
    password: t.string(''),
    'app-password': t.string(''),
    'email-address-for-error-log': t.string(''),
  }),
});

export type FirebaseConfig = t.TypeOf<typeof firebaseConfigTypeDef>;

const isFirebaseConfig = firebaseConfigTypeDef.is;

export const fillFirebaseConfig = (config: unknown): FirebaseConfig => {
  if (!isFirebaseConfig(config)) {
    logger.error(
      `${Result.unwrapThrow(Json.stringify(config))} is not FirebaseConfig`,
    );

    return {
      gmail: {
        email: '',
        password: '',
        'app-password': '',
        'email-address-for-error-log': '',
      },
    };
  }

  return config;
};
