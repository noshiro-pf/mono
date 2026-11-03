import { Json, Result } from 'ts-data-forge';

/**
 * An answer, and what its body held or a sentence saying why it held nothing.
 * The body of a refusal is not read: its status is what the caller words.
 */
export type ReadAnswer = Readonly<{
  response: Response;
  body: Result<unknown, string> | undefined;
}>;

/**
 * Asks, reads the body, and asks once more when a `2xx` body could not be read:
 * one that is not JSON, or that stops before its end. `undefined` when GitHub
 * could not be reached.
 *
 * GitHub sends such a body now and then, an empty one or a page of HTML, and
 * the next answer is good; a read of the report sends a dozen requests at once,
 * and one blip in any of them fails the whole read. Every request this page
 * sends only reads, so a second asking changes nothing but what it costs. At
 * once rather than after a pause: an answer that is wrong every time is the
 * next poll's to try. A second asking that cannot reach GitHub leaves the first
 * answer, whose rate-limit headers are still worth reading.
 *
 * `ask` is told whether it is the second asking, so that a request the browser
 * may answer from its cache skips it: revalidated, the bad body it stored is
 * the one it hands back.
 *
 * @param subject What was asked for, as it reads after "GitHub answered" —
 *   `'the workflow runs'` — or nothing when the request has no better name.
 */
export const askAndRead = async (
  ask: (again: boolean) => Promise<Response>,
  subject?: string,
): Promise<ReadAnswer | undefined> => {
  const first = await askOnce(async () => ask(false), subject);

  return first === undefined ||
    !first.response.ok ||
    first.body === undefined ||
    Result.isOk(first.body)
    ? first
    : ((await askOnce(async () => ask(true), subject)) ?? first);
};

/**
 * The value a body holds, or a sentence saying what came back instead.
 *
 * The sentence carries the status, the `Content-Type` and the size received,
 * because without them an empty body, an HTML error page and a body cut short
 * all read the same — and a failure that has passed by the time anyone reads it
 * leaves nothing else to tell them apart.
 */
export const readJson = async (
  response: Response,
  subject?: string,
): Promise<Result<unknown, string>> => {
  const bytes = await response.arrayBuffer().catch(() => undefined);

  if (bytes === undefined) {
    return Result.err(
      `GitHub's answer${subject === undefined ? '' : ` for ${subject}`} stopped before its end (${response.status}). Check the connection and try again.`,
    );
  }

  const parsed = Json.parse(UTF8.decode(bytes));

  if (Result.isOk(parsed)) {
    return Result.ok(parsed.value);
  }

  return Result.err(
    [
      'GitHub answered',
      ...(subject === undefined ? [] : [subject]),
      `with something that is not JSON (${[
        response.status,
        response.headers.get('content-type') ?? 'no Content-Type',
        bytes.byteLength === 0 ? 'an empty body' : `${bytes.byteLength} bytes`,
      ].join(', ')}).`,
    ].join(' '),
  );
};

/**
 * What a request that got no answer the browser would hand over is said as.
 * The browser does not say why, and a request GitHub gave up on is one of the
 * reasons: its time-out page carries no CORS header, so it reads the same as no
 * connection. Naming what was asked is what tells the two apart — a time-out
 * names the same heavy request on every read.
 *
 * @param subject What was asked for, as {@link askAndRead} takes it.
 */
export const unreachable = (subject?: string): string =>
  subject === undefined
    ? 'Could not reach the GitHub API, or GitHub did not answer in time. Check the connection and try again.'
    : (`Could not reach the GitHub API for ${subject}, or GitHub did not finish it in time. Check the connection and try again.` as const);

const UTF8 = new TextDecoder();

const askOnce = async (
  ask: () => Promise<Response>,
  subject: string | undefined,
): Promise<ReadAnswer | undefined> => {
  const response = await ask().catch((error: unknown) => error);

  return response instanceof Response
    ? {
        response,
        body: response.ok ? await readJson(response, subject) : undefined,
      }
    : undefined;
};
