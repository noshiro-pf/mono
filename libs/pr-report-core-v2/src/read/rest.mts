/**
 * REST reads: one answer, or the pages of a list, decoded, each failure a
 * {@link ReadError}. A list is read by GitHub's `Link: rel="next"` to its end,
 * to the page that holds what the reader asked for ({@link restPagesUntil}), or
 * to a count that says whether the list held more ({@link restLeadingItems});
 * any of them beyond {@link MAX_PAGES} pages fails. No reader reports a list
 * cut short as the whole (#3217): it fails, or says so.
 */

import { Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { Read, ReadError } from '../snapshot/index.mjs';
import { classifyHttp, malformed, unanswered } from './classify.mjs';
import type { HttpRequest, ReadContext } from './transport.mjs';

/**
 * `GET` one repository route (`path` after `/repos/<owner>/<name>`, or a full
 * `https://` URL), decoded by `schema`.
 */
export const restGet = async <A,>(
  context: ReadContext,
  what: string,
  path: string,
  schema: t.Type<A>,
  media: RestMedia = 'json',
): Promise<Read<A>> =>
  Result.map(
    await getDecoded(
      context,
      what,
      urlOf(context, path),
      (body) => schema.validate(body),
      media,
    ),
    ({ value }) => value,
  );

/**
 * Every page of a list route, `per_page=100`, followed by `rel="next"` until
 * there is none. More than {@link MAX_PAGES} pages is an error rather than a
 * list cut short.
 */
export const restAllPages = async <A,>(
  context: ReadContext,
  what: string,
  path: string,
  schema: t.Type<readonly A[]>,
  media: RestMedia = 'json',
): Promise<Read<readonly A[]>> =>
  pagesFrom(
    context,
    what,
    withPerPage(urlOf(context, path)),
    (body) => schema.validate(body),
    NEVER_LAST,
    MAX_PAGES,
    media,
  );

/**
 * {@link restAllPages} for a route whose list sits in a field of the body
 * (`check_runs`, `workflow_runs`): `schema` decodes the body, `select` takes
 * the list out of it.
 */
export const restAllPagesOf = async <B, A>(
  context: ReadContext,
  what: string,
  path: string,
  schema: t.Type<B>,
  select: (body: B) => readonly A[],
  media: RestMedia = 'json',
): Promise<Read<readonly A[]>> =>
  pagesFrom(
    context,
    what,
    withPerPage(urlOf(context, path)),
    (body) => Result.map(schema.validate(body), select),
    NEVER_LAST,
    MAX_PAGES,
    media,
  );

/**
 * The pages of a list until `isLast`, given every item read so far, says they
 * hold what is wanted, or to the list's end; failing, as {@link restAllPages}
 * does, beyond {@link MAX_PAGES}.
 */
export const restPagesUntil = async <A,>(
  context: ReadContext,
  what: string,
  path: string,
  schema: t.Type<readonly A[]>,
  isLast: (items: readonly A[]) => boolean,
  media: RestMedia = 'json',
): Promise<Read<readonly A[]>> =>
  pagesFrom(
    context,
    what,
    withPerPage(urlOf(context, path)),
    (body) => schema.validate(body),
    isLast,
    MAX_PAGES,
    media,
  );

/**
 * The first `count` items of a list that `keep` accepts, reading only as many
 * pages as that takes; `complete` is whether the list held no more.
 */
export const restLeadingItems = async <A,>(
  context: ReadContext,
  what: string,
  path: string,
  schema: t.Type<readonly A[]>,
  keep: (item: A) => boolean,
  count: number,
  media: RestMedia = 'json',
): Promise<Read<Readonly<{ items: readonly A[]; complete: boolean }>>> =>
  leadingFrom(
    context,
    what,
    withPerPage(urlOf(context, path)),
    (body) => schema.validate(body),
    keep,
    count,
    MAX_PAGES,
    media,
  );

/**
 * Sends `body` as JSON to one repository route (`path` as for {@link restGet})
 * by `method`, and decodes the answer by `schema`; an empty answer
 * (`204 No Content`) is decoded as `null`. The one way a command writes to
 * GitHub over REST, so that what a read refuses a write refuses too.
 */
export const restWrite = async <A,>(
  context: ReadContext,
  what: string,
  method: 'DELETE' | 'PATCH' | 'POST' | 'PUT',
  path: string,
  body: unknown,
  schema: t.Type<A>,
): Promise<Read<A>> => {
  // `undefined` sends no body: `JSON.stringify` would answer `undefined` too,
  // typed as a string.
  const text = body === undefined ? Result.ok(undefined) : Json.stringify(body);

  if (Result.isErr(text)) {
    return Result.err(malformed(what, `not sent: ${text.value}`));
  }

  return Result.map(
    await sendDecoded(
      context,
      what,
      { method, url: urlOf(context, path), body: text.value, media: 'json' },
      (answer) => schema.validate(answer),
    ),
    ({ value }) => value,
  );
};

/**
 * How GitHub writes a body in an answer: `json` as written, or `full` with the
 * rendering beside it (`body_html`), in which GitHub marks the closing keywords
 * it recognized.
 */
export type RestMedia = 'full' | 'json';

/** The `rel="next"` URL of a `Link` header, if any. */
export const nextLinkOf = (link: string | undefined): string | undefined =>
  link
    ?.split(',')
    .map((part) => NEXT_LINK.exec(part.trim())?.groups?.['url'])
    .find((url) => url !== undefined);

/** Whether `fullName` (`owner/name`) is the context's; GitHub ignores case. */
export const isContextRepository = (
  fullName: string | undefined,
  { owner, name }: Readonly<{ owner: string; name: string }>,
): boolean => fullName?.toLowerCase() === `${owner}/${name}`.toLowerCase();

/**
 * Whether an issue whose `repository_url` is `repositoryUrl` is the context
 * repository's: one transferred away answers, redirected, as another's.
 */
export const answersAsContext = (
  repositoryUrl: string,
  context: Readonly<{ owner: string; name: string }>,
): boolean =>
  isContextRepository(repositoryUrl.split('/repos/', 2).at(1), context);

/**
 * The open pull requests whose head is `branch` of this repository, `perPage`
 * of them: qualified by the owner, so that a fork's branch of the same name is
 * not taken for it.
 */
export const headedPullsPath = (
  { owner }: Readonly<{ owner: string }>,
  branch: string,
  perPage: number,
): string =>
  `/pulls?state=open&per_page=${perPage}&head=${pathSegment(`${owner}:${branch}`)}` as const;

/** One path segment, whatever the name holds (`release/1.x` included). */
export const pathSegment = (name: string): string =>
  // eslint-disable-next-line no-restricted-globals -- a path segment, not a query string
  encodeURIComponent(name);

/**
 * A pull request's body as GitHub rendered it, which `full` media adds to every
 * answer that has the body: the key is always there, and null for a null body.
 */
export const RenderedBodySchema = t.union([t.string(), t.nullType]);

/** A bound on a list that never ends. */
export const MAX_PAGES = 100;

const NEVER_LAST = (): boolean => false;

const TOO_MANY_PAGES = (what: string): ReadError =>
  malformed(what, 'more pages than allowed; not read as the whole');

const NEXT_LINK = /^<(?<url>[^>]+)>;\s*rel="next"$/u;

/** A path GitHub writes by the repository's numeric id. */
const BY_REPOSITORY_ID = /^\/repositories\/\d+\//u;

/**
 * Where every route is: a URL elsewhere, a next link included, fails its read
 * before anything is sent, so that the token never leaves GitHub's API.
 */
const API_ORIGIN = 'https://api.github.com';

type Decode<A> = (body: unknown) => Result<A, readonly t.ValidationError[]>;

/** What a request sends, before the headers. */
type Sent = Readonly<{
  method: HttpRequest['method'];
  url: string;
  body: string | undefined;
  media: RestMedia;
}>;

const ACCEPT = {
  json: 'application/vnd.github+json',
  full: 'application/vnd.github.full+json',
} as const satisfies ReadonlyRecord<RestMedia, string>;

const urlOf = (context: ReadContext, path: string): string =>
  path.startsWith('https://')
    ? path
    : (`${API_ORIGIN}/repos/${context.owner}/${context.name}${path}` as const);

const withPerPage = (url: string): string => {
  const parsed = URL.parse(url);

  // One that is no URL fails as it is read, in `requestOf`.
  if (parsed === null) {
    return url;
  }

  if (!parsed.searchParams.has('per_page')) {
    parsed.searchParams.set('per_page', '100');
  }

  return parsed.href;
};

/** On GitHub's API, with no credentials in it. */
const isPlainlyApi = ({
  origin,
  username,
  password,
}: Readonly<{ origin: string; username: string; password: string }>): boolean =>
  origin === API_ORIGIN && username === '' && password === '';

/**
 * The `GET` of `url`, the token on it: refused, before anything is sent, for a
 * URL that is no URL, is off GitHub's API or carries credentials, so that the
 * token never leaves the API. It is `malformed`: such a URL comes from an
 * answer's link, or from a caller's mistake.
 */
const requestOf = (
  context: ReadContext,
  what: string,
  { method, url, body, media }: Sent,
): Read<HttpRequest> => {
  const parsed = URL.parse(url);

  if (parsed === null) {
    return Result.err(malformed(what, `not asked: ${url} is no URL`));
  }

  if (!isPlainlyApi(parsed)) {
    return Result.err(
      malformed(what, `not asked: ${url} is not plainly GitHub’s API`),
    );
  }

  return Result.ok({
    method,
    // What was checked is what is sent.
    url: parsed.href,
    headers: {
      accept: ACCEPT[media],
      'x-github-api-version': '2022-11-28',
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      ...(context.token === undefined
        ? {}
        : { authorization: `Bearer ${context.token}` }),
    },
    body,
  } as const);
};

/**
 * The next page GitHub links, asked by the route `url` named when GitHub wrote
 * the link by the repository's numeric id (`/repositories/<id>/issues?page=2`),
 * which a Claude Code session's proxy refuses: the link's query, which GitHub
 * writes whole, replaces `url`'s and carries the page. Any other link is followed as written, and fails its read
 * when not plainly GitHub's API.
 *
 * The link's path is not compared with `url`'s: GitHub links the route it
 * answered, and writes its encoding (`release/1.x` for `release%2F1.x`) its own
 * way, so a comparison refuses the very links the rewrite is for.
 */
const nextPageOf = (
  url: string,
  link: string | undefined,
): string | undefined => {
  if (link === undefined) {
    return undefined;
  }

  const linked = URL.parse(link, url);

  // One that is no URL fails as it is followed, in `requestOf`.
  if (linked === null) {
    return link;
  }

  // One with credentials is followed as written, and so refused.
  if (!isPlainlyApi(linked) || !BY_REPOSITORY_ID.test(linked.pathname)) {
    return linked.href;
  }

  // `url` is what `requestOf` sent, parsed already: it parses.
  const mut_next = new URL(url);

  mut_next.search = linked.search;

  return mut_next.href;
};

/**
 * What one request answered, decoded, with the next page it links; an empty
 * answer, which a write may give, decodes as `null`.
 */
const sendDecoded = async <A,>(
  context: ReadContext,
  what: string,
  sent: Sent,
  decode: Decode<A>,
): Promise<Read<Readonly<{ value: A; next: string | undefined }>>> => {
  const request = requestOf(context, what, sent);

  if (Result.isErr(request)) {
    return request;
  }

  const answer = await context.transport(request.value);

  if (answer.kind === 'failed') {
    return Result.err(unanswered(what, answer.message));
  }

  const error = classifyHttp(what, answer);

  if (error !== undefined) {
    return Result.err(error);
  }

  const parsed =
    answer.body.trim() === '' ? Result.ok(null) : Json.parse(answer.body);

  if (Result.isErr(parsed)) {
    return Result.err(malformed(what, parsed.value));
  }

  const decoded = decode(parsed.value);

  return Result.isErr(decoded)
    ? Result.err(
        malformed(what, t.validationErrorsToMessages(decoded.value).join('; ')),
      )
    : Result.ok({
        value: decoded.value,
        next: nextPageOf(request.value.url, nextLinkOf(answer.headers['link'])),
      });
};

const getDecoded = async <A,>(
  context: ReadContext,
  what: string,
  url: string,
  decode: Decode<A>,
  media: RestMedia,
): Promise<Read<Readonly<{ value: A; next: string | undefined }>>> =>
  sendDecoded(
    context,
    what,
    { method: 'GET', url, body: undefined, media },
    decode,
  );

/**
 * The pages from `url` on, read one after another (each names the next), after
 * `before`, the items of the pages read already.
 */
const pagesFrom = async <A,>(
  context: ReadContext,
  what: string,
  url: string,
  decode: Decode<readonly A[]>,
  isLast: (items: readonly A[]) => boolean,
  pagesLeft: number,
  media: RestMedia,
  before: readonly A[] = [],
): Promise<Read<readonly A[]>> => {
  if (pagesLeft <= 0) {
    return Result.err(TOO_MANY_PAGES(what));
  }

  const page = await getDecoded(context, what, url, decode, media);

  if (Result.isErr(page)) {
    return page;
  }

  const { value, next } = page.value;

  const read = [...before, ...value] as const;

  return next === undefined || isLast(read)
    ? Result.ok(read)
    : pagesFrom(
        context,
        what,
        next,
        decode,
        isLast,
        pagesLeft - 1,
        media,
        read,
      );
};

const leadingFrom = async <A,>(
  context: ReadContext,
  what: string,
  url: string,
  decode: Decode<readonly A[]>,
  keep: (item: A) => boolean,
  count: number,
  pagesLeft: number,
  media: RestMedia,
): Promise<Read<Readonly<{ items: readonly A[]; complete: boolean }>>> => {
  if (pagesLeft <= 0) {
    return Result.err(TOO_MANY_PAGES(what));
  }

  const page = await getDecoded(context, what, url, decode, media);

  if (Result.isErr(page)) {
    return page;
  }

  const { value, next } = page.value;

  const kept = value.filter(keep);

  if (kept.length > count) {
    return Result.ok({ items: kept.slice(0, count), complete: false });
  }

  if (next === undefined) {
    return Result.ok({ items: kept, complete: true });
  }

  if (kept.length === count) {
    // Whether the next page holds one more is not worth a page read: it is
    // unknown, so the list is not called complete.
    return Result.ok({ items: kept, complete: false });
  }

  const rest = await leadingFrom(
    context,
    what,
    next,
    decode,
    keep,
    count - kept.length,
    pagesLeft - 1,
    media,
  );

  return Result.map(rest, (later) => ({
    items: [...kept, ...later.items],
    complete: later.complete,
  }));
};
