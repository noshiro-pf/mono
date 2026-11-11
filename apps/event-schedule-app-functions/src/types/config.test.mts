import { logger } from 'firebase-functions/v1';
import { discordWebhookUrlOf, fillFirebaseConfig } from './config.mjs';

vi.mock(import('firebase-functions/v1'), async (importOriginal) => {
  const original = await importOriginal();

  return { ...original, logger: { ...original.logger, error: vi.fn() } };
});

const gmail = {
  email: 'from@example.com',
  password: 'password',
  'app-password': 'password',
  'email-address-for-error-log': 'log@example.com',
} as const;

describe(discordWebhookUrlOf, () => {
  test('reads the webhook URL', () => {
    assert.strictEqual(
      discordWebhookUrlOf({
        gmail,
        discord: { 'error-report-webhook-url': 'https://discord.test/hook' },
      }),
      'https://discord.test/hook',
    );
  });

  test('is empty, and logs nothing, with no discord object', () => {
    vi.mocked(logger.error).mockClear();

    assert.strictEqual(discordWebhookUrlOf({ gmail }), '');

    assert.deepStrictEqual(vi.mocked(logger.error).mock.calls, []);
  });

  test('is empty for a discord object written wrong, which leaves the mail settings as they are', () => {
    vi.mocked(logger.error).mockClear();

    const config = {
      gmail,
      discord: 'https://discord.test/hook',
    } as const;

    assert.strictEqual(discordWebhookUrlOf(config), '');

    assert.strictEqual(vi.mocked(logger.error).mock.calls.length, 1);

    // Not logged: the URL is a credential.
    assert.notInclude(
      JSON.stringify(vi.mocked(logger.error).mock.calls),
      'discord.test',
    );

    assert.deepStrictEqual(fillFirebaseConfig(config).gmail, gmail);
  });
});
