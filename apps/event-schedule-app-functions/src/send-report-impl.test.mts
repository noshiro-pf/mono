import { https, logger } from 'firebase-functions/v1';
import { hasKey, isRecord } from 'ts-data-forge';
import { handleSendReport } from './send-report-impl.mjs';

vi.mock(import('firebase-functions/v1'), async (importOriginal) => {
  const original = await importOriginal();

  return { ...original, logger: { ...original.logger, error: vi.fn() } };
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
