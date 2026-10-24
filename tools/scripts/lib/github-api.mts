/**
 * The GitHub API over `fetch`, and the credential it needs, for every command
 * that does not go through `gh`.
 *
 * `open-pr` used to shell out to `gh`. It does not any more, because the
 * places it is most useful — a cloud container, a runner — are the places
 * `gh` is least likely to be installed, while a token is already there. The
 * API is the same one `gh` calls; only where the credential comes from
 * differs, so `gh auth token` stays as the last resort for a machine set up
 * that way with nothing exported.
 *
 * `mature-updates.mts` keeps a client of its own: it runs before
 * `pnpm install`, when nothing this imports exists yet.
 */

import type { RepoRef } from 'pr-report-core';
import { Arr, Json, Result, unknownToString } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { ReadonlyRecord } from 'ts-type-forge';
import { projectRootPath } from '../project-root-path.mjs';
import { parseJson, readJsonFile } from './json.mjs';
import { git } from './shell.mjs';

/** What every call here needs: who to talk to, and as whom. */
export type ApiContext = Readonly<{ repo: RepoRef; token: string }>;

/**
 * The token the environment holds, if any: `GH_TOKEN`, then `GITHUB_TOKEN`.
 *
 * That is the order `gh` reads them in, so that with both set a command over
 * `fetch` acts as the same account as one over `gh` — `unblock-prs` writes
 * its comments through `gh`, and the commands here trust a comment by whose
 * account wrote it. A workflow sets either only by passing it; Actions
 * exports neither by itself. `github-settings-as-code` reads a list of its
 * own, without `GITHUB_TOKEN`, and says why in `resolveAuthToken`.
 */
export const tokenFromEnv = (): string | undefined => {
  const token = process.env['GH_TOKEN'] ?? process.env['GITHUB_TOKEN'] ?? '';

  return token === '' ? undefined : token;
};

/**
 * The token to authenticate with: the environment first, `gh` only if it has
 * to be. `GH_TOKEN` and `GITHUB_TOKEN` are what a runner and a container
 * already set, and asking `gh` first would fail on exactly the machines this
 * is for.
 */
export const resolveToken = async (): Promise<Result<string, string>> => {
  const fromEnv = tokenFromEnv();

  if (fromEnv !== undefined) {
    return Result.ok(fromEnv);
  }

  const fromGh = await git('gh auth token');

  if (Result.isErr(fromGh)) {
    return Result.err(
      'no credential: set GH_TOKEN or GITHUB_TOKEN, or authenticate `gh`',
    );
  }

  const trimmed = fromGh.value.trim();

  return trimmed === ''
    ? Result.err(
        'no credential: set GH_TOKEN or GITHUB_TOKEN, or authenticate `gh`',
      )
    : Result.ok(trimmed);
};

/**
 * The repository a command acts on, for every command here: `repoOption`
 * (`--repo owner/name`) when given, else `origin`, else the root
 * `package.json`.
 *
 * `origin` before the manifest because a fork's checkout names the fork
 * there and the upstream in the manifest, and a command that reads the queue
 * of one and pushes or comments on the other is worse than either. The
 * manifest is for a checkout whose `origin` names no GitHub repository at
 * all — a proxy remote in a container, a tree without `.git` — where it is
 * the only thing left that says.
 */
export const resolveRepo = async (
  repoOption?: string,
): Promise<Result<RepoRef, string>> => {
  if (repoOption !== undefined) {
    return parseRepoRef(repoOption);
  }

  const origin = await git('git remote get-url origin');

  const fromOrigin = Result.isOk(origin)
    ? repoOfUrl(origin.value.trim())
    : undefined;

  if (fromOrigin !== undefined) {
    return Result.ok(fromOrigin);
  }

  const manifest = await readJsonFile(
    `${projectRootPath}/package.json`,
    PackageJsonSchema,
  );

  const fromManifest = Result.isOk(manifest)
    ? repoOfUrl(manifest.value.repository.url)
    : undefined;

  return fromManifest === undefined
    ? Result.err(
        'cannot tell which repository this is: origin is not a GitHub remote, and the root package.json names none; pass --repo owner/name',
      )
    : Result.ok(fromManifest);
};

/** `owner/name`, as it is written everywhere else. */
export const parseRepoRef = (raw: string): Result<RepoRef, string> => {
  const parts = raw.split('/');

  if (!Arr.isFixedLengthArray(2, parts)) {
    return Result.err(`expected owner/name, got ${JSON.stringify(raw)}`);
  }

  const [owner, name] = parts;

  return owner === '' || name === ''
    ? Result.err(`expected owner/name, got ${JSON.stringify(raw)}`)
    : Result.ok({ owner, name });
};

/**
 * The GitHub repository a remote or `repository.url` names, in the forms a
 * checkout here is cloned with or a manifest declares:
 * `https://github.com/owner/name(.git)`, `git+https://…`, and
 * `git@github.com:owner/name(.git)`.
 */
export const repoOfUrl = (url: string): RepoRef | undefined => {
  const match =
    /github\.com[/:](?<owner>[\w.-]+)\/(?<name>[\w.-]+?)(?:\.git)?$/u.exec(url);

  const owner = match?.groups?.['owner'];

  const name = match?.groups?.['name'];

  return owner === undefined || name === undefined
    ? undefined
    : { owner, name };
};

const PackageJsonSchema = t.record({
  repository: t.record({ url: t.string() }),
});

/** The token and the repository, for a command that calls {@link rest}. */
export const resolveApiContext = async (): Promise<
  Result<ApiContext, string>
> => {
  const token = await resolveToken();

  if (Result.isErr(token)) {
    return token;
  }

  const repo = await resolveRepo();

  return Result.isErr(repo)
    ? repo
    : Result.ok({ repo: repo.value, token: token.value });
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
  { query, body, withBodyHtml = false }: RestOptions = {},
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
    accept: withBodyHtml
      ? 'application/vnd.github.full+json'
      : 'application/vnd.github+json',
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return Result.isErr(response)
    ? Result.err(response.value.message)
    : validate(response.value, schema);
};

/**
 * The login the token authenticates as. Outside `rest` because the route is
 * not under the repository.
 */
export const viewerLogin = async (
  token: string,
): Promise<Result<string, string>> => {
  const response = await send({
    url: 'https://api.github.com/user',
    method: 'GET',
    token,
    accept: 'application/vnd.github+json',
    body: undefined,
  });

  return Result.isErr(response)
    ? Result.err(response.value.message)
    : Result.map(
        validate(response.value, t.record({ login: t.string() })),
        ({ login }) => login,
      );
};

/** What a REST call may carry besides its path. */
export type RestOptions = Readonly<{
  query?: ReadonlyRecord<string, string>;
  body?: unknown;
  /**
   * Ask for `body_html` beside `body`: GitHub's rendering, which marks the
   * closing keywords it recognized (`pr-report-core`'s
   * `closingKeywordIssuesIn`).
   */
  withBodyHtml?: boolean;
}>;

/**
 * One GraphQL mutation. Two of `open-pr`'s four writes have no REST
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

  if (Result.isErr(response)) {
    return Result.err(response.value.message);
  }

  const parsed = validate(response.value, GraphqlResponseSchema);

  if (Result.isErr(parsed)) {
    return parsed;
  }

  const errors = parsed.value.errors ?? [];

  return Arr.isEmpty(errors)
    ? Result.ok(undefined)
    : Result.err(errors.map((error) => error.message).join('; '));
};

const GraphqlResponseSchema = t.record({
  errors: t.optional(t.array(t.record({ message: t.string() }))),
});

/** One request to the API, before anything is made of the answer. */
export type GitHubRequest = Readonly<{
  url: string;
  method: 'GET' | 'PATCH' | 'POST';
  /** Absent for an anonymous read, which a public repository allows. */
  token: string | undefined;
  accept: string;
  body: string | undefined;
}>;

/**
 * Why a request came to nothing: the transport failing, or GitHub refusing
 * with a status and what it said about it.
 */
export type GitHubRefusal = Readonly<{
  message: string;
  /**
   * Whether the refusal is the rate limit being spent — the one failure a
   * reader can do something about without reading the body of the answer.
   */
  rateLimited: boolean;
}>;

/**
 * The request itself, resolving to the response body as text. A transport
 * failure and a refusal both become a {@link GitHubRefusal}; nothing here
 * throws.
 *
 * The headers are assembled here rather than passed in, so that every call
 * the commands make carries the same ones and there is one place to read.
 */
export const send = async ({
  url,
  method,
  token,
  accept,
  body,
}: GitHubRequest): Promise<Result<string, GitHubRefusal>> => {
  const response = await Result.fromPromise(
    fetch(url, {
      method,
      headers: {
        ...(token === undefined ? {} : { Authorization: `Bearer ${token}` }),
        Accept: accept,
        'X-GitHub-Api-Version': '2022-11-28',
        // GitHub rejects an API request without one.
        'User-Agent': 'noshiro-pf-mono-tools',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      ...(body === undefined ? {} : { body }),
    }),
  );

  if (Result.isErr(response)) {
    return Result.err({
      message: `request failed: ${unknownToString(response.value)}`,
      rateLimited: false,
    });
  }

  const read = await Result.fromPromise(response.value.text());

  const payload = Result.isOk(read) ? read.value : '';

  return response.value.ok
    ? Result.ok(payload)
    : Result.err({
        message: `${response.value.status} ${response.value.statusText}: ${messageFrom(payload)}`,
        rateLimited:
          response.value.headers.get('x-ratelimit-remaining') === '0',
      });
};

/** What GitHub says went wrong, or the raw body when it says nothing. */
const messageFrom = (body: string): string => {
  const parsed = Json.parse(body);

  if (Result.isErr(parsed)) {
    return body.slice(0, 200);
  }

  const validated = t
    .record({ message: t.optional(t.string()) })
    .validate(parsed.value);

  return Result.isOk(validated) && validated.value.message !== undefined
    ? validated.value.message
    : body.slice(0, 200);
};

const validate = <A,>(body: string, schema: t.Type<A>): Result<A, string> => {
  // `204 No Content`, which a workflow dispatch answers, is no JSON at all.
  if (body === '') {
    const validated = schema.validate(undefined);

    return Result.isErr(validated)
      ? Result.err(t.validationErrorsToMessages(validated.value).join('\n'))
      : Result.ok(validated.value);
  }

  return parseJson(body, schema, 'the answer from GitHub');
};
