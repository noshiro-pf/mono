import { logger } from 'firebase-functions/v1';
import { createTransport } from 'nodemailer';
import { sendEmail } from './setup-mailer.mjs';

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
