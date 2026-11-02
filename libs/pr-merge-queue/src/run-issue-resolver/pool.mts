/** How many sessions run at once, and when the issues are looked at again. */

import { Arr, Result, unknownToString } from 'ts-data-forge';

/**
 * Runs sessions on what `steps.survey` finds, up to `limits.concurrency` at
 * once and never two on one issue, until `limits.maxSessions` have run, a stop
 * is requested, or a failure is fatal; then waits for the ones running, and
 * resolves to that failure, if any.
 *
 * The issues are looked at again as soon as a session ends, and otherwise every
 * `limits.intervalMs`, which a session ending cuts short. A session counts
 * against `limits.maxSessions` from when it starts, so that the sessions
 * running never take the total past it, and stops counting if it ends having
 * spent nothing. An issue whose session failed without being fatal (a 5xx when
 * it was labelled, say) is not handed on again until the interval has passed,
 * so that it is not retried as fast as it fails. With `limits.once`, there is
 * one look, and any failure is returned.
 */
export const runPool = async <C extends Readonly<{ number: number }>>(
  limits: PoolLimits,
  steps: PoolSteps<C>,
): Promise<Result<undefined, string>> => {
  // Each issue a session is running on, settled once it has ended and been
  // accounted for.
  const mut_running = new Map<number, Promise<void>>();

  // Issues whose session failed, and when they may be handed on again.
  const mut_retryAt = new Map<number, number>();

  const mut_state: { counted: number; failure: string | undefined } = {
    counted: 0,
    failure: undefined,
  };

  // What the last look said it is waiting on.
  let mut_lastNotes = '';

  const start = (candidate: C): void => {
    mut_state.counted += 1;

    const settled = steps
      .run(candidate)
      .catch((error: unknown): Result<never, RunError> =>
        Result.err({ fatal: false, message: unknownToString(error) }),
      )
      .then((outcome) => {
        mut_running.delete(candidate.number);

        if (Result.isOk(outcome) && outcome.value.spent) {
          return;
        }

        mut_state.counted -= 1;

        if (Result.isOk(outcome)) {
          return;
        }

        if (outcome.value.fatal || limits.once) {
          mut_state.failure ??= outcome.value.message;

          if (mut_running.size > 0) {
            steps.log(
              `${outcome.value.message}\nStarting no more sessions; waiting for the ${mut_running.size} running.`,
            );
          }

          return;
        }

        steps.log(outcome.value.message);

        mut_retryAt.set(candidate.number, steps.now() + limits.intervalMs);
      });

    mut_running.set(candidate.number, settled);
  };

  // Read through a call: a session that ends while a look is awaited can set
  // the failure, and a signal the stop.
  const over = (): boolean =>
    steps.stopRequested() || mut_state.failure !== undefined;

  while (!over()) {
    const slots = Math.min(
      limits.concurrency - mut_running.size,
      limits.maxSessions - mut_state.counted,
    );

    if (slots <= 0 && mut_running.size === 0) {
      steps.log(
        `${mut_state.counted} sessions have run, as many as --max-sessions allows; stopping.`,
      );

      break;
    }

    if (slots > 0) {
      // A throw (a full temporary directory, say) is one failed look, not the
      // end of a command meant to be left running.
      const surveyed = await steps
        .survey()
        .catch((error: unknown): Result<never, RunError> =>
          Result.err({ fatal: false, message: unknownToString(error) }),
        );

      if (Result.isErr(surveyed)) {
        if (surveyed.value.fatal || limits.once) {
          mut_state.failure ??= surveyed.value.message;

          break;
        }

        steps.log(surveyed.value.message);
      }

      // What the look found is stale if the run ended while it was taken.
      if (over()) {
        break;
      }

      const now = steps.now();

      const startable = Result.isOk(surveyed)
        ? surveyed.value.fresh.filter(({ number }) => !mut_running.has(number))
        : ([] as const);

      const next = startable
        .filter(({ number }) => (mut_retryAt.get(number) ?? now) <= now)
        .slice(0, slots);

      const held = startable
        .filter(({ number }) => (mut_retryAt.get(number) ?? now) > now)
        .map(({ number }) => `#${number}`);

      for (const candidate of next) {
        start(candidate);
      }

      // Said again only when it changes, as `run-unblock-prs-skill` does.
      const waiting =
        Result.isOk(surveyed) && Arr.isEmpty(next)
          ? Arr.toUnshifted(surveyed.value.notes)(
              Arr.isNonEmpty(held)
                ? [
                    `${held.join(', ')}: failed to start; tried again once the interval has passed.`,
                  ]
                : [],
            )
              .filter((line) => line !== '')
              .join('\n')
          : undefined;

      const changed = waiting !== undefined && waiting !== mut_lastNotes;

      if (Arr.isNonEmpty(next)) {
        mut_lastNotes = '';
      } else if (changed) {
        mut_lastNotes = waiting;

        if (waiting !== '') {
          steps.log(waiting);
        }
      }

      if (limits.once) {
        break;
      }

      if (mut_running.size === 0 && (changed || Result.isErr(surveyed))) {
        steps.log(
          `Checking again every ${Math.round(limits.intervalMs / 60_000)} min.`,
        );
      }
    }

    // Until a session ends, or the interval passes while a slot is free.
    const wake = new AbortController();

    await (slots > 0
      ? Promise.race([
          steps.pause(limits.intervalMs, wake.signal),
          ...mut_running.values(),
        ])
      : Promise.race(mut_running.values()));

    wake.abort();
  }

  await Promise.all(mut_running.values());

  return mut_state.failure === undefined
    ? Result.ok(undefined)
    : Result.err(mut_state.failure);
};

export type PoolLimits = Readonly<{
  /** Sessions running at once. */
  concurrency: number;
  /** Sessions that may have spent anything, before it stops starting more. */
  maxSessions: number;
  /** One look, then wait for what it started. */
  once: boolean;
  /** Between looks that start nothing. */
  intervalMs: number;
}>;

/** What the pool runs, given rather than imported so that a test can. */
export type PoolSteps<C extends Readonly<{ number: number }>> = Readonly<{
  /**
   * The issues a session may be started on, in the order they are taken, and
   * what the look has to say about the rest.
   */
  survey: () => Promise<
    Result<Readonly<{ fresh: readonly C[]; notes: string }>, RunError>
  >;
  /** Starts a session on `candidate`, and resolves once it has been settled. */
  run: (
    candidate: C,
  ) => Promise<Result<Readonly<{ spent: boolean }>, RunError>>;
  /** Sleeps `ms`, or until `signal` aborts or a stop is requested. */
  pause: (ms: number, signal: Readonly<AbortSignal>) => Promise<void>;
  stopRequested: () => boolean;
  now: () => number;
  log: (message: string) => void;
}>;

/** A failure, and whether it stops the command rather than waiting it out. */
export type RunError = Readonly<{ fatal: boolean; message: string }>;
