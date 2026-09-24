/**
 * The GitHub API over `fetch`, and the credential it needs.
 *
 * This command used to shell out to `gh`. It does not any more, because the
 * places it is most useful — a cloud container, a runner — are the places
 * `gh` is least likely to be installed, while a token is already there. The
 * API is the same one `gh` calls; only where the credential comes from
 * differs, so `gh auth token` stays as the last resort for a machine set up
 * that way with nothing exported.
 */

import { Arr, Json, Result, unknownToString } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { type ReadonlyRecord } from 'ts-type-forge';
import { git } from '../unblock-prs/github.mjs';

/** Owner and repository, as the API paths spell them. */
export type Repo = Readonly<{ owner: string; name: string }>;

/** What every call here needs: who to talk to, and as whom. */
export type ApiContext = Readonly<{ repo: Repo; token: string }>;

/**
 * The token to authenticate with: the environment first, `gh` only if it has
 * to be. `GITHUB_TOKEN` and `GH_TOKEN` are what a runner and a container
 * already set, and asking `gh` first would fail on exactly the machines this
 * change is for.
 */
export const resolveToken = async (): Promise<Result<string, string>> => {
  const fromEnv = process.env['GITHUB_TOKEN'] ?? process.env['GH_TOKEN'] ?? '';

  if (fromEnv !== '') return Result.ok(fromEnv);

  const fromGh = await git('gh auth token');

  if (Result.isErr(fromGh)) {
    return Result.err(
      'no credential: set GITHUB_TOKEN or GH_TOKEN, or authenticate `gh`',
    );
  }

  const trimmed = fromGh.value.trim();

  return trimmed === ''
    ? Result.err(
        'no credential: set GITHUB_TOKEN or GH_TOKEN, or authenticate `gh`',
      )
    : Result.ok(trimmed);
};

/**
 * The repository to act on, read from `origin` rather than from a flag: the
 * pull request belongs where the branch is about to be pushed, and nothing
 * good comes of those two disagreeing.
 */
export const resolveRepo = async (): Promise<Result<Repo, string>> => {
  const url = await git('git remote get-url origin');

  if (Result.isErr(url)) {
    return Result.err(`cannot read origin: ${url.value}`);
  }

  const trimmed = url.value.trim();

  // `https://github.com/owner/repo(.git)` and `git@github.com:owner/repo(.git)`
  // are the two forms a checkout here is cloned with.
  const match =
    /github\.com[/:](?<owner>[^/]+)\/(?<name>[^/]+?)(?:\.git)?$/u.exec(trimmed);

  const owner = match?.groups?.['owner'];

  const name = match?.groups?.['name'];

  return owner === undefined || name === undefined
    ? Result.err(`origin is not a GitHub remote: ${trimmed}`)
    : Result.ok({ owner, name });
};

/**
 * One REST call, resolving to the parsed body. A non-2xx becomes an error
 * naming the status and what GitHub said about it, because "403" on its own
 * sends the reader to the wrong place.
 */
export const rest = async <A,>(
  context: ApiContext,
  method: 'GET' | 'PATCH' | 'POST',
  path: string,
  schema: t.Type<A>,
  { query, body }: RestOptions = {},
): Promise<Result<A, string>> => {
  // `URLSearchParams` rather than hand-assembled pairs: a branch name carries
  // slashes and the one qualified parameter here carries a colon.
  const parameters =
    query === undefined ? undefined : new URLSearchParams({ ...query });

  const search =
    parameters === undefined ? '' : (`?${parameters.toString()}` as const);

  const response = await send({
    url: `https://api.github.com/repos/${context.repo.owner}/${context.repo.name}${path}${search}`,
    method,
    token: context.token,
    accept: 'application/vnd.github+json',
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return Result.isErr(response) ? response : validate(response.value, schema);
};

/** What a REST call may carry besides its path. */
export type RestOptions = Readonly<{
  query?: ReadonlyRecord<string, string>;
  body?: unknown;
}>;

/**
 * One GraphQL mutation. Two of this command's four writes have no REST
 * equivalent — GitHub exposes neither "mark ready for review" nor "enable
 * auto-merge" there — so those go through here rather than through a
 * different tool.
 *
 * GraphQL answers 200 to a failed mutation and puts the reason in `errors`,
 * so that is checked rather than the status alone.
 */
export const graphql = async (
  context: ApiContext,
  query: string,
  variables: ReadonlyRecord<string, string>,
): Promise<Result<undefined, string>> => {
  const response = await send({
    url: 'https://api.github.com/graphql',
    method: 'POST',
    token: context.token,
    accept: 'application/json',
    body: JSON.stringify({ query, variables }),
  });

  if (Result.isErr(response)) return response;

  const parsed = validate(response.value, GraphqlResponseSchema);

  if (Result.isErr(parsed)) return parsed;

  const errors = parsed.value.errors ?? [];

  return Arr.isEmpty(errors)
    ? Result.ok(undefined)
    : Result.err(errors.map((error) => error.message).join('; '));
};

const GraphqlResponseSchema = t.record({
  errors: t.optional(t.array(t.record({ message: t.string() }))),
});

/**
 * The request itself, resolving to the response body as text. A transport
 * failure and a refusal both become an error string; nothing here throws.
 *
 * The headers are assembled here rather than passed in, so that every call
 * this command makes carries the same ones and there is one place to read.
 */
const send = async ({
  url,
  method,
  token,
  accept,
  body,
}: Readonly<{
  url: string;
  method: 'GET' | 'PATCH' | 'POST';
  token: string;
  accept: string;
  body: string | undefined;
}>): Promise<Result<string, string>> => {
  const response = await Result.fromPromise(
    fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: accept,
        'X-GitHub-Api-Version': '2022-11-28',
        // GitHub rejects an API request without one.
        'User-Agent': 'noshiro-pf-mono-open-pr',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      ...(body === undefined ? {} : { body }),
    }),
  );

  if (Result.isErr(response)) {
    return Result.err(`request failed: ${unknownToString(response.value)}`);
  }

  const read = await Result.fromPromise(response.value.text());

  const payload = Result.isOk(read) ? read.value : '';

  return response.value.ok
    ? Result.ok(payload)
    : Result.err(
        `${response.value.status} ${response.value.statusText}: ${messageFrom(payload)}`,
      );
};

/** What GitHub says went wrong, or the raw body when it says nothing. */
const messageFrom = (body: string): string => {
  const parsed = Json.parse(body);

  if (Result.isErr(parsed)) return body.slice(0, 200);

  const validated = t
    .record({ message: t.optional(t.string()) })
    .validate(parsed.value);

  return Result.isOk(validated) && validated.value.message !== undefined
    ? validated.value.message
    : body.slice(0, 200);
};

const validate = <A,>(body: string, schema: t.Type<A>): Result<A, string> => {
  const parsed = Json.parse(body);

  if (Result.isErr(parsed)) {
    return Result.err(`invalid JSON from GitHub: ${parsed.value}`);
  }

  const validated = schema.validate(parsed.value);

  return Result.isErr(validated)
    ? Result.err(t.validationErrorsToMessages(validated.value).join('\n'))
    : Result.ok(validated.value);
};
