import { Result } from 'ts-data-forge';
import { runListener } from './run-listener.mjs';

describe(runListener, () => {
  test('logs a returned Result.err', async () => {
    const logError = vi.fn();

    const err = Result.err('missing poll');

    runListener('messageReactionAdd', () => Promise.resolve(err), logError);

    await vi.waitFor(() => {
      expect(logError).toHaveBeenCalledExactlyOnceWith(
        'on messageReactionAdd error:',
        err,
      );
    });
  });

  test('logs a rejection of the listener body', async () => {
    const logError = vi.fn();

    const error = new Error('Missing Permissions');

    runListener('messageReactionAdd', () => Promise.reject(error), logError);

    await vi.waitFor(() => {
      expect(logError).toHaveBeenCalledExactlyOnceWith(
        'on messageReactionAdd threw:',
        error,
      );
    });
  });

  test('logs a synchronous throw of the listener body', async () => {
    const logError = vi.fn();

    const error = new Error('content is null');

    runListener(
      'messageCreate',
      () => {
        throw error;
      },
      logError,
    );

    await vi.waitFor(() => {
      expect(logError).toHaveBeenCalledExactlyOnceWith(
        'on messageCreate threw:',
        error,
      );
    });
  });

  test('starts the body before it returns', () => {
    const body = vi.fn(() => Promise.resolve(Result.ok(undefined)));

    runListener('messageUpdate', body, vi.fn());

    expect(body).toHaveBeenCalledExactlyOnceWith();
  });

  test('logs nothing for a Result.ok', async () => {
    const logError = vi.fn();

    runListener(
      'messageUpdate',
      () => Promise.resolve(Result.ok(undefined)),
      logError,
    );

    // A macrotask runs after every microtask the body and the logging queue.
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(logError).not.toHaveBeenCalled();
  });
});
