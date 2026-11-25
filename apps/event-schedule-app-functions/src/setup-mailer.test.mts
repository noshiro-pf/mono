import { logger } from 'firebase-functions/v1';
import { createTransport } from 'nodemailer';
import { getMailDelivery } from './env.mjs';
import { sendEmail, withMailSession } from './setup-mailer.mjs';

vi.mock(import('firebase-functions/v1'), async (importOriginal) => {
  const original = await importOriginal();

  return { ...original, logger: { ...original.logger, log: vi.fn() } };
});

vi.mock(import('nodemailer'), async (importOriginal) => ({
  ...(await importOriginal()),
  createTransport: vi.fn(),
}));

vi.mock(import('./env.mjs'), async (importOriginal) => ({
  ...(await importOriginal()),
  getFirebaseConfig: () => ({
    gmail: {
      email: 'from@example.com',
      'app-password': 'password',
      password: 'password',
      'email-address-for-error-log': 'log@example.com',
    },
  }),
  getMailDelivery: vi.fn((): 'log' | 'smtp' => 'smtp'),
}));

const mailOptions = {
  from: 'from@example.com',
  to: 'to@example.com',
  subject: 'subject',
  text: 'text',
} as const;

describe(sendEmail, () => {
  test('rejects, and logs no success, when the mail is not sent', async () => {
    vi.mocked(createTransport).mockReturnValue(
      // Only `sendMail` is read.
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      { sendMail: () => Promise.reject(new Error('smtp')) } as never,
    );

    const log = vi.mocked(logger.log);

    log.mockClear();

    await expect(sendEmail(mailOptions)).rejects.toThrow('smtp');

    assert.deepStrictEqual(log.mock.calls, []);
  });

  test('logs success once the mail is sent', async () => {
    vi.mocked(createTransport).mockReturnValue(
      // Only `sendMail` is read.
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      { sendMail: () => Promise.resolve({}) } as never,
    );

    const log = vi.mocked(logger.log);

    log.mockClear();

    await sendEmail(mailOptions);

    assert.strictEqual(log.mock.calls.length, 1);
  });
});

/** A transport whose sends resolve, and whose `close` is a spy. */
const resolvingTransport = (): Readonly<{
  sendMail: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
}> =>
  ({
    sendMail: vi.fn(() => Promise.resolve({})),
    close: vi.fn(),
  }) as const;

describe(withMailSession, () => {
  beforeEach(() => {
    vi.mocked(createTransport).mockReset();

    vi.mocked(getMailDelivery).mockReturnValue('smtp');
  });

  test('sends the mails of a session over one pooled transport, closed once the session ends', async () => {
    const transport = resolvingTransport();

    // Only `sendMail` and `close` are read.
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    vi.mocked(createTransport).mockReturnValue(transport as never);

    await withMailSession(async () => {
      await sendEmail(mailOptions);

      await sendEmail({ ...mailOptions, to: 'other@example.com' });

      assert.strictEqual(transport.close.mock.calls.length, 0);
    });

    assert.strictEqual(vi.mocked(createTransport).mock.calls.length, 1);

    assert.include(vi.mocked(createTransport).mock.calls[0]?.[0], {
      pool: true,
    });

    assert.strictEqual(transport.sendMail.mock.calls.length, 2);

    assert.strictEqual(transport.close.mock.calls.length, 1);
  });

  test('closes the transport when the session rejects, and passes the rejection on', async () => {
    const transport = resolvingTransport();

    // Only `sendMail` and `close` are read.
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    vi.mocked(createTransport).mockReturnValue(transport as never);

    await expect(
      withMailSession(async () => {
        await sendEmail(mailOptions);

        throw new Error('run');
      }),
    ).rejects.toThrow('run');

    assert.strictEqual(transport.close.mock.calls.length, 1);
  });

  test('opens no transport for a session that sends nothing', async () => {
    await withMailSession(() => Promise.resolve());

    assert.strictEqual(vi.mocked(createTransport).mock.calls.length, 0);
  });

  test('gives each send outside a session a transport of its own', async () => {
    vi.mocked(createTransport).mockImplementation(
      // Only `sendMail` and `close` are read.
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      () => resolvingTransport() as never,
    );

    await sendEmail(mailOptions);

    await sendEmail(mailOptions);

    assert.strictEqual(vi.mocked(createTransport).mock.calls.length, 2);
  });
});

describe('sendEmail with mail-delivery "log"', () => {
  beforeEach(() => {
    vi.mocked(createTransport).mockReset();

    vi.mocked(getMailDelivery).mockReturnValue('log');
  });

  test('logs the recipient and subject and opens no transport, in a session or not', async () => {
    const log = vi.mocked(logger.log);

    log.mockClear();

    await sendEmail(mailOptions);

    await withMailSession(async () => {
      await sendEmail(mailOptions);
    });

    assert.strictEqual(vi.mocked(createTransport).mock.calls.length, 0);

    const line =
      'mail not sent (mail-delivery is "log"): to to@example.com, subject subject';

    assert.deepStrictEqual(log.mock.calls, [[line], [line]]);
  });
});
