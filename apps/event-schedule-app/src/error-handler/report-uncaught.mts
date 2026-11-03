import { isRecord, Result, unknownToString } from 'ts-data-forge';

/**
 * What the page does with an error nothing caught, a thrown one (`onError`, for
 * the window's `error` event) or a promise rejection no handler took
 * (`onUnhandledRejection`): logs it in place of the browser's line, and sends
 * it through `sendReport`. Each distinct error is sent once, and at most
 * `maxReports` are sent, so that an error that repeats does not call the
 * function each time.
 */
export const createUncaughtErrorReporter = (
  sendReport: SendReport,
  maxReports: number = defaultMaxReports,
): UncaughtErrorReporter => {
  const mut_reported = new Set<string>();

  const report = (uncaught: unknown, errorString: string): void => {
    // The value itself, which the console shows with its fields and frames.
    console.error(uncaught);

    if (mut_reported.has(errorString) || mut_reported.size >= maxReports) {
      return;
    }

    mut_reported.add(errorString);

    sendReport({ error: errorString })
      .then((result) => {
        if (Result.isErr(result)) {
          console.error(`The error report failed: ${result.value.message}`);
        }
      })
      .catch(console.error);
  };

  return {
    onError: (ev) => {
      report(
        ev.error ?? ev.message,
        ev.error === null || ev.error === undefined
          ? // No error: a script from another origin, whose message is only
            // "Script error.", or a `throw null`.
            [
              ev.message,
              ev.filename === ''
                ? ''
                : `${ev.filename}:${ev.lineno}:${ev.colno}`,
            ]
              .filter((part) => part !== '')
              .join(' ')
          : describeError(ev.error),
      );

      // Logged by `report`; the browser's own line would say it again. Only
      // once it is, so that the browser's line stays if `report` throws.
      ev.preventDefault();
    },
    onUnhandledRejection: (ev) => {
      report(ev.reason, describeError(ev.reason));

      ev.preventDefault();
    },
  };
};

export type SendReport = (
  report: Readonly<{ error: string }>,
) => Promise<Result<unknown, Readonly<{ message: string }>>>;

/**
 * The listeners, typed by the fields they read, which a window's `ErrorEvent`
 * and `PromiseRejectionEvent` have.
 */
export type UncaughtErrorReporter = Readonly<{
  onError: (
    ev: Readonly<{
      error: unknown;
      message: string;
      filename: string;
      lineno: number;
      colno: number;
      preventDefault: () => void;
    }>,
  ) => void;
  onUnhandledRejection: (
    ev: Readonly<{ reason: unknown; preventDefault: () => void }>,
  ) => void;
}>;

const defaultMaxReports = 20;

/**
 * An `Error` (a `DOMException` is one) with its name, message and stack:
 * Firefox's and Safari's stacks have no first line naming the error. Anything
 * else is named by its type, or its keys for an object, which may carry what
 * the user entered, so it is not sent as it is.
 */
const describeError = (error: unknown): string => {
  // An error reporter must work on a browser that predates `Error.isError`.
  // eslint-disable-next-line unicorn/no-instanceof-builtins
  if (error instanceof Error) {
    const head =
      error.message === ''
        ? error.name
        : (`${error.name}: ${error.message}` as const);

    const stack = error.stack ?? '';

    return stack === ''
      ? head
      : stack.startsWith(head)
        ? stack
        : [head, stack].join('\n');
  }

  return error instanceof Event
    ? `${error.constructor.name} "${error.type}"`
    : isRecord(error)
      ? `{ ${Object.keys(error).join(', ')} }`
      : unknownToString(error);
};
