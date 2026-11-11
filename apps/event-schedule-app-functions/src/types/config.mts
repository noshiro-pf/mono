import { logger } from 'firebase-functions/v1';
import { hasKey, isRecord, Json, Result } from 'ts-data-forge';
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

const isDiscordConfig = t.record({
  'error-report-webhook-url': t.string(''),
}).is;

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

/**
 * The Discord webhook error reports are posted to, from the optional `discord`
 * object of the same secret, or `''` for none. Read apart from
 * {@link fillFirebaseConfig}, so that a `discord` object written wrong stops
 * the posts and not the mail. Its value is not logged: the webhook URL is a
 * credential.
 */
export const discordWebhookUrlOf = (config: unknown): string => {
  if (!isRecord(config) || !hasKey(config, 'discord')) {
    return '';
  }

  if (!isDiscordConfig(config.discord)) {
    logger.error(
      'RUNTIME_CONFIG.discord is not { "error-report-webhook-url": string }; error reports are only mailed.',
    );

    return '';
  }

  return config.discord['error-report-webhook-url'];
};
