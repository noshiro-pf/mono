import { Result, unknownToString } from 'ts-data-forge';
import {
  createUncaughtErrorReporter,
  type SendReport,
  type UncaughtErrorReporter,
} from './report-uncaught.mjs';

describe(createUncaughtErrorReporter, () => {
  test('reports a promise rejection nothing handled, with its reason', async () => {
    const { reporter, sent, logged } = setup();

    const ev = rejection('offline');

    reporter.onUnhandledRejection(ev);

    await settle();

    assert.deepStrictEqual(sent, ['offline']);

    assert.deepStrictEqual(logged, ['offline']);

    // The browser does not log it a second time.
    assert.isTrue(ev.defaultPrevented());
  });

  test('reports a thrown error with its name, message and stack', async () => {
    const { reporter, sent } = setup();

    const ev = thrown(new TypeError('x is null'));

    reporter.onError(ev);

    await settle();

    assert.strictEqual(sent.length, 1);

    assert.match(sent[0] ?? '', /^TypeError: x is null\n\s+at /u);

    assert.isTrue(ev.defaultPrevented());
  });

  test('names an error with no message once', async () => {
    const { reporter, sent } = setup();

    // eslint-disable-next-line unicorn/error-message -- an error with no message is the case under test
    reporter.onUnhandledRejection(rejection(new Error()));

    await settle();

    assert.match(sent[0] ?? '', /^Error/u);

    // V8 heads the stack with "Error" alone, which the name is not added to.
    assert.notMatch(sent[0] ?? '', /^Error[^\n]*\nError/u);
  });

  test('reports an error with no stack by its name and message', async () => {
    const { reporter, sent } = setup();

    const mut_error = new Error('lost');

    Object.defineProperty(mut_error, 'stack', { value: undefined });

    reporter.onUnhandledRejection(rejection(mut_error));

    await settle();

    assert.deepStrictEqual(sent, ['Error: lost']);
  });

  test('names an event or an object by its type or keys, not its contents', async () => {
    const { reporter, sent } = setup();

    reporter.onUnhandledRejection(rejection(new Event('error')));

    reporter.onUnhandledRejection(
      rejection({ email: 'bob@example.com', status: 403 }),
    );

    await settle();

    assert.deepStrictEqual(sent, ['Event "error"', '{ email, status }']);
  });

  test('names an error whose stack does not', async () => {
    const { reporter, sent } = setup();

    // Firefox's and Safari's stacks are only the frames.
    const mut_error = new RangeError('too far');

    Object.defineProperty(mut_error, 'stack', { value: 'render@app.js:1:2' });

    reporter.onError(thrown(mut_error));

    await settle();

    assert.deepStrictEqual(sent, ['RangeError: too far\nrender@app.js:1:2']);
  });

  test('reports a DOMException with its name and message', async () => {
    const { reporter, sent } = setup();

    reporter.onUnhandledRejection(
      rejection(
        new DOMException('Write permission denied.', 'NotAllowedError'),
      ),
    );

    await settle();

    assert.match(sent[0] ?? '', /^NotAllowedError: Write permission denied\./u);
  });

  test('reports the message, and the place if any, when the browser gives no error', async () => {
    const { reporter, sent } = setup();

    // A script from another origin.
    reporter.onError({
      ...thrown(null),
      message: 'Script error.',
      filename: '',
      lineno: 0,
      colno: 0,
    });

    // `throw null` in the page's own script.
    reporter.onError({
      ...thrown(null),
      message: 'Uncaught null',
      filename: 'https://example.com/app.js',
      lineno: 3,
      colno: 5,
    });

    await settle();

    assert.deepStrictEqual(sent, [
      'Script error.',
      'Uncaught null https://example.com/app.js:3:5',
    ]);
  });

  test('reports a repeated error once, and stops after the limit', async () => {
    const { reporter, sent } = setup({ maxReports: 2 });

    for (const reason of ['a', 'a', 'b', 'c']) {
      reporter.onUnhandledRejection(rejection(reason));
    }

    await settle();

    assert.deepStrictEqual(sent, ['a', 'b']);
  });

  test('says so when the report itself fails', async () => {
    const { reporter, logged } = setup({ reportFails: true });

    reporter.onUnhandledRejection(rejection('offline'));

    await settle();

    assert.deepStrictEqual(logged, [
      'offline',
      'The error report failed: unavailable',
    ]);
  });
});

type ErrorEventFields = Parameters<UncaughtErrorReporter['onError']>[0];

type RejectionFields = Parameters<
  UncaughtErrorReporter['onUnhandledRejection']
>[0];

/** The fields of an `ErrorEvent` for `error`, and whether its default was prevented. */
const thrown = (
  error: unknown,
): ErrorEventFields & Readonly<{ defaultPrevented: () => boolean }> => {
  const mut_state = { prevented: false };

  return {
    error,
    message: '',
    filename: 'app.js',
    lineno: 1,
    colno: 1,
    preventDefault: () => {
      mut_state.prevented = true;
    },
    defaultPrevented: () => mut_state.prevented,
  };
};

/** The fields of a `PromiseRejectionEvent`, and whether its default was prevented. */
const rejection = (
  reason: unknown,
): RejectionFields & Readonly<{ defaultPrevented: () => boolean }> => {
  const mut_state = { prevented: false };

  return {
    reason,
    preventDefault: () => {
      mut_state.prevented = true;
    },
    defaultPrevented: () => mut_state.prevented,
  };
};

const setup = (
  options?: Readonly<{ maxReports?: number; reportFails?: boolean }>,
): Readonly<{
  reporter: UncaughtErrorReporter;
  sent: readonly string[];
  logged: readonly string[];
}> => {
  const mut_sent: string[] = [];

  const mut_logged: string[] = [];

  vi.spyOn(console, 'error').mockImplementation((message: unknown) => {
    mut_logged.push(unknownToString(message));
  });

  const sendReport: SendReport = ({ error }) => {
    mut_sent.push(error);

    return Promise.resolve(
      options?.reportFails === true
        ? Result.err({ message: 'unavailable' })
        : Result.ok(undefined),
    );
  };

  return {
    reporter: createUncaughtErrorReporter(sendReport, options?.maxReports),
    sent: mut_sent,
    logged: mut_logged,
  } as const;
};

const settle = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
};

afterEach(() => {
  vi.restoreAllMocks();
});
