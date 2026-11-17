import {
  parseEnableExplicitFunctionReturnTypeTransformerOptions,
  type EnableExplicitFunctionReturnTypeTransformerOptions,
} from 'ts-codemod-lib';
import { isRecord, Result, unknownToString } from 'ts-data-forge';

/**
 * The options `--transformer-options` gives, by transformer. Only the
 * transformers listed here take options from the command line.
 */
export type TransformerOptions = Readonly<{
  'enable-explicit-function-return-type'?: EnableExplicitFunctionReturnTypeTransformerOptions;
}>;

/**
 * Reads `--transformer-options`: a JSON object from transformer name to that
 * transformer's options, each transformer named also selected by
 * `--transformer`.
 */
export const parseTransformerOptions = (
  json: string | undefined,
  selected: readonly string[],
): Result<TransformerOptions, string> => {
  if (json === undefined) {
    return Result.ok({});
  }

  const parsed = Result.fromThrowable(() => JSON.parse(json) as unknown);

  if (Result.isErr(parsed)) {
    return Result.err(
      `--transformer-options is not valid JSON: ${unknownToString(parsed.value)}`,
    );
  }

  if (!isRecord(parsed.value)) {
    return Result.err(
      '--transformer-options must be a JSON object keyed by transformer name.',
    );
  }

  let mut_options: TransformerOptions = {};

  for (const [name, value] of Object.entries(parsed.value)) {
    if (!selected.includes(name)) {
      return Result.err(
        `--transformer-options names "${name}", which no --transformer selects.`,
      );
    }

    if (name !== 'enable-explicit-function-return-type') {
      return Result.err(`"${name}" takes no options from the command line.`);
    }

    const options =
      parseEnableExplicitFunctionReturnTypeTransformerOptions(value);

    if (Result.isErr(options)) {
      return Result.err(`Options of "${name}": ${options.value}`);
    }

    mut_options = { ...mut_options, [name]: options.value };
  }

  return Result.ok(mut_options);
};
