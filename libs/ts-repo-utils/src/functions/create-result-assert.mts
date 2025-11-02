import { hasKey, isRecord, isString, Result } from 'ts-data-forge';
import '../node-global.mjs';

type ResultProducer<TConfig, TOk, TErr> = (
  config: TConfig,
) => Promise<Result<TOk, TErr>>;

export type CreateResultAssertOptions<Config, Ok, Err> = Readonly<{
  run: ResultProducer<Config, Ok, Err>;
  onSuccess?: (value: Ok, config: Config) => void | Promise<void>;
  onError?: (error: Err, config: Config) => void | Promise<void>;
  exitCode?: number;
}>;

/**
 * Converts a function that returns a Result into an assert-style variant that
 * exits the process when the Result is Err. This is useful for building CLI
 * commands that should stop execution on failure but remain composable when a
 * Result is preferred.
 */
export const createResultAssert = <Config, Ok, Err>({
  run,
  onSuccess,
  onError,
  exitCode = 1,
}: CreateResultAssertOptions<Config, Ok, Err>): ((
  config: Config,
) => Promise<Ok>) => {
  const defaultOnError = (error: Err): void => {
    if (
      isRecord(error) &&
      hasKey(error, 'message') &&
      isString(error.message)
    ) {
      echo(error.message);
    } else {
      console.error(error);
    }
  };

  return async (config: Config): Promise<Ok> => {
    const result = await run(config);

    if (Result.isErr(result)) {
      if (onError !== undefined) {
        await onError(result.value, config);
      } else {
        defaultOnError(result.value);
      }
      process.exit(exitCode);
    }

    if (onSuccess !== undefined) {
      await onSuccess(result.value, config);
    }

    return result.value;
  };
};
