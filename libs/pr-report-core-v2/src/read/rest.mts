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
import type { ReadContext } from './transport.mjs';

/**
 * `GET` one repository route (`path` after `/repos/<owner>/<name>`, or a full
 * `https://` URL), decoded by `schema`.
 */
export const restGet = async <A,>(
  context: ReadContext,
  what: string,
  path: string,
  schema: t.Type<A>,
): Promise<Read<A>> =>
  Result.map(
    await getDecoded(context, what, urlOf(context, path), (body) =>
      schema.validate(body),
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
): Promise<Read<readonly A[]>> =>
  pagesFrom(
    context,
    what,
    withPerPage(urlOf(context, path)),
    (body) => schema.validate(body),
    NEVER_LAST,
    MAX_PAGES,
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
): Promise<Read<readonly A[]>> =>
  pagesFrom(
    context,
    what,
    withPerPage(urlOf(context, path)),
    (body) => Result.map(schema.validate(body), select),
    NEVER_LAST,
    MAX_PAGES,
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
): Promise<Read<readonly A[]>> =>
  pagesFrom(
    context,
    what,
    withPerPage(urlOf(context, path)),
    (body) => schema.validate(body),
    isLast,
    MAX_PAGES,
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
): Promise<Read<Readonly<{ items: readonly A[]; complete: boolean }>>> =>
  leadingFrom(
    context,
    what,
    withPerPage(urlOf(context, path)),
    (body) => schema.validate(body),
    keep,
    count,
    MAX_PAGES,
  );

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

/** One path segment, whatever the name holds (`release/1.x` included). */
export const pathSegment = (name: string): string =>
  // eslint-disable-next-line no-restricted-globals -- a path segment, not a query string
  encodeURIComponent(name);

/** A bound on a list that never ends. */
export const MAX_PAGES = 100;

const NEVER_LAST = (): boolean => false;

const TOO_MANY_PAGES = (what: string): ReadError =>
  malformed(what, 'more pages than allowed; not read as the whole');

const NEXT_LINK = /^<(?<url>[^>]+)>;\s*rel="next"$/u;

type Decode<A> = (body: unknown) => Result<A, readonly t.ValidationError[]>;

const urlOf = (context: ReadContext, path: string): string =>
  path.startsWith('https://')
    ? path
    : (`https://api.github.com/repos/${context.owner}/${context.name}${path}` as const);

const withPerPage = (url: string): string => {
  const parsed = new URL(url);

  if (!parsed.searchParams.has('per_page')) {
    parsed.searchParams.set('per_page', '100');
  }

  return parsed.href;
};

const headersOf = (context: ReadContext): ReadonlyRecord<string, string> =>
  ({
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
    ...(context.token === undefined
      ? {}
      : { authorization: `Bearer ${context.token}` }),
  }) as const;

const getDecoded = async <A,>(
  context: ReadContext,
  what: string,
  url: string,
  decode: Decode<A>,
): Promise<Read<Readonly<{ value: A; next: string | undefined }>>> => {
  const answer = await context.transport({
    method: 'GET',
    url,
    headers: headersOf(context),
    body: undefined,
  });

  if (answer.kind === 'failed') {
    return Result.err(unanswered(what, answer.message));
  }

  const error = classifyHttp(what, answer);

  if (error !== undefined) {
    return Result.err(error);
  }

  const parsed = Json.parse(answer.body);

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
        next: nextLinkOf(answer.headers['link']),
      });
};

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
  before: readonly A[] = [],
): Promise<Read<readonly A[]>> => {
  if (pagesLeft <= 0) {
    return Result.err(TOO_MANY_PAGES(what));
  }

  const page = await getDecoded(context, what, url, decode);

  if (Result.isErr(page)) {
    return page;
  }

  const { value, next } = page.value;

  const read = [...before, ...value] as const;

  return next === undefined || isLast(read)
    ? Result.ok(read)
    : pagesFrom(context, what, next, decode, isLast, pagesLeft - 1, read);
};

const leadingFrom = async <A,>(
  context: ReadContext,
  what: string,
  url: string,
  decode: Decode<readonly A[]>,
  keep: (item: A) => boolean,
  count: number,
  pagesLeft: number,
): Promise<Read<Readonly<{ items: readonly A[]; complete: boolean }>>> => {
  if (pagesLeft <= 0) {
    return Result.err(TOO_MANY_PAGES(what));
  }

  const page = await getDecoded(context, what, url, decode);

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
  );

  return Result.map(rest, (later) => ({
    items: [...kept, ...later.items],
    complete: later.complete,
  }));
};
