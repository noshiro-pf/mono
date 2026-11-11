import { logger } from 'firebase-functions/v1';
import { Arr, hasKey, isRecord, Result } from 'ts-data-forge';
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

const isDiscordConfig = t.record({
  'error-report-webhook-url': t.string(''),
}).is;

/**
 * `config` if it is a {@link FirebaseConfig}, and otherwise empty settings, with
 * where `config` is wrong logged. Only the paths and the types expected there
 * are logged, never a value: the secret holds passwords.
 */
export const fillFirebaseConfig = (config: unknown): FirebaseConfig => {
  const result = firebaseConfigTypeDef.validate(config);

  if (Result.isErr(result)) {
    logger.error(
      `RUNTIME_CONFIG is not FirebaseConfig: ${result.value
        .map(
          ({ path, expectedType }) =>
            // An empty path is the secret itself, not one of its keys.
            `${Arr.isNonEmpty(path) ? path.join('.') : '(the whole value)'} (${expectedType})`,
        )
        .join(', ')}`,
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

  return result.value;
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
