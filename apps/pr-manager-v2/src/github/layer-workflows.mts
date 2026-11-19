import {
  isNotFound,
  malformed,
  restGet,
  type Read,
  type ReadContext,
} from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';

/**
 * The workflows `unblock-prs` dispatches on each queue layer: the
 * `speculate.workflows` of the repository's `.github/unblock-prs.json` on its
 * default branch, read over REST. None when the file is not there or says
 * nothing of checking ahead: the worker then builds no layer to check.
 */
export const readLayerWorkflows = async (
  context: ReadContext,
): Promise<Read<readonly string[]>> => {
  const read = await restGet(
    context,
    WHAT,
    `/contents/${CONFIG_PATH}`,
    t.record({ content: t.string(), encoding: t.string() }),
  );

  if (Result.isErr(read)) {
    return isNotFound(read.value) ? Result.ok([]) : read;
  }

  const text = Result.fromThrowable(() =>
    read.value.encoding === 'base64'
      ? utf8OfBase64(read.value.content)
      : read.value.content,
  );

  return Result.isErr(text)
    ? Result.err(malformed(WHAT, text.value.message))
    : layerWorkflowsOf(text.value);
};

/**
 * The `speculate.workflows` of `.github/unblock-prs.json`, given as its text,
 * each once; none when it has no `speculate`.
 */
export const layerWorkflowsOf = (text: string): Read<readonly string[]> => {
  const json = Result.fromThrowable((): unknown => JSON.parse(text));

  if (Result.isErr(json)) {
    return Result.err(malformed(WHAT, json.value.message));
  }

  const config = ConfigSchema.validate(json.value);

  return Result.isErr(config)
    ? Result.err(
        malformed(WHAT, t.validationErrorsToMessages(config.value).join('; ')),
      )
    : Result.ok(Arr.uniq(config.value.speculate?.workflows ?? []));
};

const CONFIG_PATH = '.github/unblock-prs.json';

const WHAT = CONFIG_PATH;

/** As much of `unblock-prs`'s configuration as {@link layerWorkflowsOf} reads. */
const ConfigSchema = t.record({
  speculate: t.optional(t.record({ workflows: t.array(t.string()) })),
});

/**
 * The UTF-8 text of what GitHub's contents API gives in base64, wrapped in
 * lines, which `atob` skips as ASCII whitespace.
 */
const utf8OfBase64 = (base64: string): string => {
  const decoder = new TextDecoder('utf-8', { fatal: true });

  return decoder.decode(
    Uint8Array.from(
      Array.from(atob(base64), (char) => char.codePointAt(0) ?? 0),
    ),
  );
};
