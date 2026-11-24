/**
 * What the numbers declarations name are, and the open issues' comments and
 * blockers, over GraphQL: {@link CHUNK} numbers a query, where REST asks for
 * each number, its comments and its blockers apart. A `Start-After:` chain is
 * followed a level at a time, so a level costs one query rather than a request
 * per number.
 *
 * The facts are those {@link readNumbers} and `readIssueExtrasRest` give; a
 * connection GraphQL cuts short is read again over REST, for that issue alone.
 * The token's account's comments are told by `viewerDidAuthor`, as the pull
 * requests' are, not by comparing logins, which GraphQL and REST spell apart
 * for an app.
 */

import { Arr, asPositiveUint32, hasKey, isRecord, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type {
  IssueFacts,
  OwnComment,
  Read,
  ReadError,
} from '../snapshot/index.mjs';
import { allRead } from './all-read.mjs';
import { malformed } from './classify.mjs';
import { graphqlReadAllowingMissing } from './graphql.mjs';
import {
  numbersReadOf,
  readBlockedBy,
  readNumbers,
  type ExtrasWanted,
  type IssueExtras,
  type NumberFacts,
  type NumbersRead,
  type ReadIssueExtras,
} from './rest-issues.mjs';
import { readOwnComments } from './rest-pull-requests.mjs';
import { isContextRepository } from './rest.mjs';
import type { ReadContext } from './transport.mjs';

/** {@link readNumbers}, a query for each {@link CHUNK} numbers. */
export const readNumbersGraphql = async (
  context: ReadContext,
  numbers: readonly number[],
  viewer: Read<string>,
): Promise<Read<NumbersRead>> => {
  const chunks = await Promise.all(
    Arr.chunk(numbers, CHUNK).map(async (chunk) =>
      readChunk(context, NAMED, chunk, async (number, node) =>
        numberFactsOf(context, number, node, viewer),
      ),
    ),
  );

  return Result.map(
    allRead(
      chunks.map((chunk) =>
        Result.isErr(chunk) ? chunk : allRead(chunk.value),
      ),
    ),
    (read) => numbersReadOf(read.flat()),
  );
};

/**
 * `readIssueExtrasRest`, a query for each {@link CHUNK} issues that have
 * comments or may have blockers; the rest need no read. Each issue is read or
 * unread on its own, as over REST, save that a failed query leaves every issue
 * it asked for unread.
 */
export const readIssueExtrasGraphql: ReadIssueExtras = async (
  context,
  wanted,
  viewer,
) => {
  const asked = wanted.filter(needsRead).map(({ number }) => number);

  const chunks = Arr.chunk(asked, CHUNK);

  const reads = await Promise.all(
    chunks.map(async (chunk) =>
      readChunk(context, EXTRAS, chunk, async (number, node) =>
        extrasOf(context, number, node, viewer),
      ),
    ),
  );

  const mut_byNumber = new Map<number, Read<IssueExtras>>();

  for (const [index, chunk] of chunks.entries()) {
    const read = reads[index];

    for (const [at, number] of chunk.entries()) {
      mut_byNumber.set(
        number,
        read === undefined || Result.isErr(read)
          ? (read ?? Result.err(malformed(WHAT, `#${number} was not asked`)))
          : (read.value[at] ??
              Result.err(malformed(WHAT, `#${number} has no answer`))),
      );
    }
  }

  return wanted.map((each): IssueExtras => {
    const extras = mut_byNumber.get(each.number) ?? Result.ok(NONE);

    return {
      blockedBy:
        each.dependencies?.total_blocked_by === 0
          ? Result.ok([])
          : Result.isErr(extras)
            ? extras
            : extras.value.blockedBy,
      comments:
        each.commentCount === 0
          ? Result.ok([])
          : Result.isErr(extras)
            ? extras
            : extras.value.comments,
    };
  });
};

/** The numbers one query asks for. */
const CHUNK = asPositiveUint32(50);

/** The most of a connection one query reads. */
const PAGE = 100;

const WHAT = 'the numbers named';

const NONE: IssueExtras = {
  blockedBy: Result.ok([]),
  comments: Result.ok([]),
} as const;

const BLOCKED_BY =
  `blockedBy(first: ${PAGE}) { totalCount nodes { number repository { nameWithOwner } } }` as const;

const COMMENTS =
  `comments(first: ${PAGE}) { totalCount nodes { databaseId body createdAt viewerDidAuthor } }` as const;

/** What a query asks of each number, under the field that looks it up. */
type Lookup = Readonly<{
  operation: string;
  field: string;
  fragment: readonly string[];
}>;

/** Each number, issue or pull request, whole. */
const NAMED: Lookup = {
  operation: 'NamedNumbers',
  field: 'issueOrPullRequest',
  fragment: [
    'fragment Named on IssueOrPullRequest {',
    '  __typename',
    '  ... on Issue {',
    '    number title body state stateReason url createdAt updatedAt',
    '    author { login }',
    '    repository { nameWithOwner }',
    `    labels(first: ${PAGE}) { totalCount nodes { name color description } }`,
    `    ${BLOCKED_BY}`,
    `    ${COMMENTS}`,
    '  }',
    '  ... on PullRequest {',
    '    number title prState: state merged',
    '    repository { nameWithOwner }',
    '  }',
    '}',
  ],
} as const;

/** An issue listed already: its comments and blockers alone. */
const EXTRAS: Lookup = {
  operation: 'IssueExtras',
  field: 'issue',
  fragment: [
    'fragment Named on Issue {',
    '  repository { nameWithOwner }',
    `  ${BLOCKED_BY}`,
    `  ${COMMENTS}`,
    '}',
  ],
} as const;

const RepositorySchema = t.record({ nameWithOwner: t.string() });

const connectionOf = <A,>(
  node: t.Type<A>,
): t.Type<Readonly<{ totalCount: number; nodes: readonly A[] }>> =>
  t.record({ totalCount: t.number(), nodes: t.array(node) });

const PullNodeSchema = t.record({
  title: t.string(),
  prState: t.string(),
  merged: t.boolean(),
  repository: RepositorySchema,
});

const EXTRAS_FIELDS = {
  repository: RepositorySchema,
  blockedBy: connectionOf(
    t.record({ number: t.number(), repository: RepositorySchema }),
  ),
  comments: connectionOf(
    t.record({
      databaseId: t.number(),
      body: t.string(),
      createdAt: t.string(),
      viewerDidAuthor: t.boolean(),
    }),
  ),
} as const;

const ExtrasSchema = t.record(EXTRAS_FIELDS);

/** A listed issue's answer: `null` where it has gone since it was listed. */
const ExtrasNodeSchema = t.union([ExtrasSchema, t.nullType, t.undefinedType]);

type ExtrasNode = t.TypeOf<typeof ExtrasSchema>;

const IssueNodeSchema = t.record({
  ...EXTRAS_FIELDS,
  number: t.number(),
  title: t.string(),
  body: t.string(),
  state: t.string(),
  stateReason: t.union([t.string(), t.nullType]),
  url: t.string(),
  createdAt: t.string(),
  updatedAt: t.string(),
  author: t.union([t.record({ login: t.string() }), t.nullType]),
  labels: connectionOf(
    t.record({
      name: t.string(),
      color: t.string(),
      description: t.union([t.string(), t.nullType]),
    }),
  ),
});

/** Whether an issue's extras take a read, as `readIssueExtrasRest` judges. */
const needsRead = ({ commentCount, dependencies }: ExtrasWanted): boolean =>
  commentCount > 0 || dependencies?.total_blocked_by !== 0;

/** The query for `numbers`, each as the variable `$n<index>`. */
const queryOf = (lookup: Lookup, numbers: readonly number[]): string =>
  [
    `query ${lookup.operation}($owner: String!, $name: String!${numbers
      .map((_, index) => `, $n${index}: Int!`)
      .join('')}) {`,
    '  repository(owner: $owner, name: $name) {',
    ...numbers.map(
      (_, index) =>
        `    n${index}: ${lookup.field}(number: $n${index}) { ...Named }`,
    ),
    '  }',
    '}',
    ...lookup.fragment,
  ].join('\n');

/**
 * One query for `numbers`, each answer read by `decode`, in order: a failed
 * query fails them all, an answer `decode` cannot read fails its number alone.
 */
const readChunk = async <A,>(
  context: ReadContext,
  lookup: Lookup,
  numbers: readonly number[],
  decode: (number: number, node: unknown) => Promise<Read<A>>,
): Promise<Read<readonly Read<A>[]>> => {
  const read = await graphqlReadAllowingMissing(
    context,
    WHAT,
    queryOf(lookup, numbers),
    Object.fromEntries(numbers.map((number, index) => [`n${index}`, number])),
    t.record({ repository: t.unknown() }),
  );

  if (Result.isErr(read)) {
    return read;
  }

  const { repository } = read.value;

  return Result.ok(
    await Promise.all(
      numbers.map(async (number, index) =>
        decode(
          number,
          isRecord(repository) && hasKey(repository, `n${index}`)
            ? repository[`n${index}`]
            : undefined,
        ),
      ),
    ),
  );
};

const blockersOf = async (
  context: ReadContext,
  number: number,
  blockedBy: ExtrasNode['blockedBy'],
): Promise<IssueFacts['blockedBy']> =>
  blockedBy.totalCount > blockedBy.nodes.length
    ? readBlockedBy(context, number, undefined)
    : Result.ok(
        blockedBy.nodes
          .filter(({ repository }) =>
            isContextRepository(repository.nameWithOwner, context),
          )
          .map(({ number: blocking }) => blocking),
      );

/** Unread with the viewer, as over REST, whose filter needs its login. */
const commentsOf = async (
  context: ReadContext,
  number: number,
  comments: ExtrasNode['comments'],
  viewer: Read<string>,
): Promise<Read<readonly OwnComment[]>> => {
  if (Result.isErr(viewer)) {
    return viewer;
  }

  if (comments.totalCount > comments.nodes.length) {
    return readOwnComments(context, number, viewer);
  }

  return Result.ok(
    comments.nodes
      .filter(({ viewerDidAuthor }) => viewerDidAuthor)
      .map(({ databaseId, body, createdAt }) => ({
        id: databaseId,
        body,
        createdAt,
      })),
  );
};

const extrasFrom = async (
  context: ReadContext,
  number: number,
  issue: ExtrasNode,
  viewer: Read<string>,
): Promise<IssueExtras> => {
  const [blockedBy, comments] = await Promise.all([
    blockersOf(context, number, issue.blockedBy),
    commentsOf(context, number, issue.comments, viewer),
  ]);

  return { blockedBy, comments };
};

/** One number over REST, for an issue a query could not read whole. */
const readNumberRest = async (
  context: ReadContext,
  number: number,
  viewer: Read<string>,
): Promise<Read<NumberFacts>> => {
  const read = await readNumbers(context, [number], viewer);

  if (Result.isErr(read)) {
    return read;
  }

  const issue = read.value.issues.get(number);

  const reference = read.value.references.get(number);

  return issue !== undefined
    ? Result.ok({ kind: 'issue', facts: issue })
    : reference !== undefined
      ? Result.ok(reference)
      : Result.err(malformed(WHAT, `#${number} read as nothing`));
};

const misread = (
  number: number,
  errors: Parameters<typeof t.validationErrorsToMessages>[0],
): ReadError =>
  malformed(
    `${WHAT}: #${number}`,
    t.validationErrorsToMessages(errors).join('; '),
  );

/**
 * What `node`, the answer for `number`, says it is: `unknown` for none (it
 * names nothing the token may see) or another repository's (an issue
 * transferred away).
 */
const numberFactsOf = async (
  context: ReadContext,
  number: number,
  node: unknown,
  viewer: Read<string>,
): Promise<Read<NumberFacts>> => {
  if (node === null || node === undefined) {
    return Result.ok({ kind: 'unknown', number });
  }

  const pull = PullNodeSchema.validate(node);

  if (Result.isOk(pull)) {
    return isContextRepository(pull.value.repository.nameWithOwner, context)
      ? Result.ok({
          kind: 'pull-request',
          number,
          title: pull.value.title,
          // REST's word for a merged one too.
          state: pull.value.prState === 'OPEN' ? 'open' : 'closed',
          merged: pull.value.merged,
        })
      : Result.ok({ kind: 'unknown', number });
  }

  const issue = IssueNodeSchema.validate(node);

  if (Result.isErr(issue)) {
    return Result.err(misread(number, issue.value));
  }

  if (!isContextRepository(issue.value.repository.nameWithOwner, context)) {
    return Result.ok({ kind: 'unknown', number });
  }

  // A label GraphQL leaves out would be missed in silence: REST reads them all.
  if (issue.value.labels.totalCount > issue.value.labels.nodes.length) {
    return readNumberRest(context, number, viewer);
  }

  const extras = await extrasFrom(context, number, issue.value, viewer);

  return Result.ok({
    kind: 'issue',
    facts: {
      number: issue.value.number,
      state: issue.value.state.toLowerCase(),
      stateReason: issue.value.stateReason?.toLowerCase(),
      title: issue.value.title,
      body: issue.value.body,
      author: issue.value.author?.login ?? '',
      url: issue.value.url,
      labels: issue.value.labels.nodes.map(({ name, color, description }) => ({
        name,
        color,
        description: description ?? '',
      })),
      createdAt: issue.value.createdAt,
      updatedAt: issue.value.updatedAt,
      commentCount: issue.value.comments.totalCount,
      ...extras,
    },
  });
};

/** The comments and blockers in `node`, the answer for the listed `number`. */
const extrasOf = async (
  context: ReadContext,
  number: number,
  node: unknown,
  viewer: Read<string>,
): Promise<Read<IssueExtras>> => {
  const issue = ExtrasNodeSchema.validate(node);

  if (Result.isErr(issue)) {
    return Result.err(misread(number, issue.value));
  }

  return issue.value !== null &&
    issue.value !== undefined &&
    isContextRepository(issue.value.repository.nameWithOwner, context)
    ? Result.ok(await extrasFrom(context, number, issue.value, viewer))
    : Result.err(malformed(WHAT, `#${number} is no issue of this repository`));
};
