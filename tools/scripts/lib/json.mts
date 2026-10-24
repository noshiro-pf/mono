/** Reading JSON into a schema's type, from text or from a file. */

import * as fs from 'node:fs/promises';
import { Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';

/**
 * `text` parsed and validated against `schema`. `source` names where the text
 * came from — a file, an API route, a command — so that the message says
 * which answer was wrong, not only how.
 */
export const parseJson = <A,>(
  text: string,
  schema: t.Type<A>,
  source: string,
): Result<A, string> => {
  const parsed = Json.parse(text);

  if (Result.isErr(parsed)) {
    return Result.err(`${source} is not valid JSON: ${parsed.value}`);
  }

  const validated = schema.validate(parsed.value);

  return Result.isErr(validated)
    ? Result.err(
        `${source} has an unexpected shape:\n${t.validationErrorsToMessages(validated.value).join('\n')}`,
      )
    : Result.ok(validated.value);
};

/** {@link parseJson} of a file's contents, the file naming itself. */
export const readJsonFile = async <A,>(
  file: string,
  schema: t.Type<A>,
): Promise<Result<A, string>> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const text = await Result.fromPromise(fs.readFile(file, 'utf8'));

  return Result.isErr(text)
    ? Result.err(`cannot read ${file}`)
    : parseJson(text.value, schema, file);
};
