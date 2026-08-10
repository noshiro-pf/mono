import * as t from '@noshiro/io-ts';
import { Json, Result } from '@noshiro/ts-utils';
import { logger } from 'firebase-functions';

const firebaseConfigTypeDef = t.record({
  gmail: t.record({
    email: t.string(''),
    password: t.string(''),
    'app-password': t.string(''),
    'email-address-for-error-log': t.string(''),
  }),
});

type FirebaseConfig = t.TypeOf<typeof firebaseConfigTypeDef>;

const isFirebaseConfig = firebaseConfigTypeDef.is;

export const fillFirebaseConfig = (config: JsonValue): FirebaseConfig => {
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
