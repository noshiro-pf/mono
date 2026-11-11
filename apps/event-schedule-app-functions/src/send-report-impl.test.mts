import { https, logger } from 'firebase-functions/v1';
import { hasKey, isRecord } from 'ts-data-forge';
import { postToDiscord } from './discord-webhook.mjs';
import { getDiscordWebhookUrl, getFirebaseConfig } from './env.mjs';
import {
  deliverToAny,
  handleSendReport,
  sendReportImpl,
} from './send-report-impl.mjs';
import { sendEmail } from './setup-mailer.mjs';

vi.mock(import('firebase-functions/v1'), async (importOriginal) => {
  const original = await importOriginal();

  return { ...original, logger: { ...original.logger, error: vi.fn() } };
});

vi.mock(import('./env.mjs'), async (importOriginal) => ({
  ...(await importOriginal()),
  getFirebaseConfig: vi.fn(),
  getDiscordWebhookUrl: vi.fn(),
}));

vi.mock(import('./setup-mailer.mjs'), async (importOriginal) => ({
  ...(await importOriginal()),
  sendEmail: vi.fn(() => Promise.resolve()),
}));

vi.mock(import('./discord-webhook.mjs'), () => ({
  postToDiscord: vi.fn(() => Promise.resolve()),
}));

describe(sendReportImpl, () => {
  const gmail = {
    email: 'from@example.com',
    password: 'password',
    'app-password': 'password',
    'email-address-for-error-log': 'log@example.com',
  } as const;

  beforeEach(() => {
    vi.mocked(sendEmail).mockClear();

    vi.mocked(postToDiscord).mockClear();
  });

  test('only mails the report when no webhook is configured', async () => {
    vi.mocked(getFirebaseConfig).mockReturnValue({ gmail });

    vi.mocked(getDiscordWebhookUrl).mockReturnValue('');

    await sendReportImpl({ error: String.raw`a\nb` });

    assert.strictEqual(vi.mocked(sendEmail).mock.calls.length, 1);

    assert.strictEqual(
      vi.mocked(sendEmail).mock.calls[0]?.[0].to,
      'log@example.com',
    );

    assert.deepStrictEqual(vi.mocked(postToDiscord).mock.calls, []);
  });

  test('mails the report and posts it to the configured webhook', async () => {
    vi.mocked(getFirebaseConfig).mockReturnValue({ gmail });

    vi.mocked(getDiscordWebhookUrl).mockReturnValue(
      'https://discord.test/hook',
    );

    await sendReportImpl({ error: String.raw`a\nb` });

    assert.strictEqual(vi.mocked(sendEmail).mock.calls.length, 1);

    assert.deepStrictEqual(vi.mocked(postToDiscord).mock.calls, [
      [
        {
          webhookUrl: 'https://discord.test/hook',
          title: 'エラー報告がありました。',
          text: 'a\nb',
        },
      ],
    ]);
  });
});

describe(handleSendReport, () => {
  test('mails the report and answers', async () => {
    const send = vi.fn(() => Promise.resolve());

    await handleSendReport(
      { error: 'boom' },
      { withinBudget: () => true, send },
    );

    assert.deepStrictEqual(send.mock.calls, [[{ error: 'boom' }]]);
  });

  test('answers invalid-argument for a payload that is not a report', async () => {
    const send = vi.fn(() => Promise.resolve());

    assert.strictEqual(
      await codeOfRejection(
        handleSendReport({ error: 0 }, { withinBudget: () => true, send }),
      ),
      'invalid-argument',
    );

    assert.deepStrictEqual(send.mock.calls, []);
  });

  // The client shows its error toast for any error, and its success toast
  // otherwise, so a report that was not mailed must not answer success.
  test('logs the report and answers resource-exhausted once the budget is used up', async () => {
    const send = vi.fn(() => Promise.resolve());

    const logged = spyOnLoggerError();

    assert.strictEqual(
      await codeOfRejection(
        handleSendReport(
          { error: 'boom' },
          { withinBudget: () => false, send },
        ),
      ),
      'resource-exhausted',
    );

    assert.deepStrictEqual(send.mock.calls, []);

    assert.isTrue(logged().some((args) => args.includes('boom')));
  });

  test('logs the report and answers internal when the mail fails', async () => {
    const logged = spyOnLoggerError();

    assert.strictEqual(
      await codeOfRejection(
        handleSendReport(
          { error: 'boom' },
          {
            withinBudget: () => true,
            send: () => Promise.reject(new Error('smtp')),
          },
        ),
      ),
      'internal',
    );

    assert.isTrue(logged().some((args) => args.includes('boom')));
  });

  test('answers internal when sending throws before it returns a promise', async () => {
    spyOnLoggerError();

    assert.strictEqual(
      await codeOfRejection(
        handleSendReport(
          { error: 'boom' },
          {
            withinBudget: () => true,
            send: () => {
              throw new Error('no runtime config');
            },
          },
        ),
      ),
      'internal',
    );
  });
});

describe(deliverToAny, () => {
  test('resolves when one way delivers and logs the one that failed', async () => {
    const logged = spyOnLoggerError();

    await deliverToAny('boom', [
      { name: 'mail', send: () => Promise.reject(new Error('smtp')) },
      { name: 'Discord', send: () => Promise.resolve() },
    ]);

    assert.isTrue(
      logged().some(
        (args) =>
          typeof args[0] === 'string' &&
          args[0].includes('mail') &&
          args.includes('boom'),
      ),
    );
  });

  test('tries every way, even after one delivered', async () => {
    const mut_tried: string[] = [];

    await deliverToAny('boom', [
      {
        name: 'mail',
        send: () => {
          mut_tried.push('mail');

          return Promise.resolve();
        },
      },
      {
        name: 'Discord',
        send: () => {
          mut_tried.push('Discord');

          return Promise.resolve();
        },
      },
    ]);

    assert.deepStrictEqual(mut_tried.toSorted(), ['Discord', 'mail']);
  });

  test('rejects when every way fails, a throw included', async () => {
    spyOnLoggerError();

    await expect(
      deliverToAny('boom', [
        { name: 'mail', send: () => Promise.reject(new Error('smtp')) },
        {
          name: 'Discord',
          send: () => {
            throw new Error('no fetch');
          },
        },
      ]),
    ).rejects.toThrow();
  });
});

/** The `HttpsError` code `promise` rejects with, or `'resolved'`. */
const codeOfRejection = async (promise: Promise<void>): Promise<unknown> => {
  try {
    await promise;

    return 'resolved';
  } catch (error) {
    assert.instanceOf(error, https.HttpsError);

    return isRecord(error) && hasKey(error, 'code') ? error.code : undefined;
  }
};

/** What `logger.error` gets from now until the test ends. */
const spyOnLoggerError = (): (() => readonly (readonly unknown[])[]) => {
  const error = vi.mocked(logger.error);

  error.mockClear();

  return () => error.mock.calls;
};
