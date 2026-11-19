/**
 * The issues GitHub links to the pull requests merged lately, over GraphQL,
 * which REST does not serve.
 */

import { Arr, hasKey, isRecord, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { ClosingIssue, Read } from '../snapshot/index.mjs';
import { allRead } from './all-read.mjs';
import { malformed } from './classify.mjs';
import { graphqlRead } from './graphql.mjs';
import { isContextRepository } from './rest.mjs';
import type { ReadContext } from './transport.mjs';

/**
 * For each of `numbers`, the issues of this repository GitHub links to it as
 * closed by it (`closingIssuesReferences`), each with its title and state:
 * {@link CHUNK} pull requests a query. A pull request linked to more than it
 * reads fails the whole, as an open one's does.
 */
export const readLinkedClosingIssuesGraphql = async (
  context: ReadContext,
  numbers: readonly number[],
): Promise<Read<ReadonlyMap<number, readonly ClosingIssue[]>>> =>
  Result.map(
    allRead(
      await Promise.all(
        Arr.chunk(numbers, CHUNK).map(async (chunk) =>
          readChunk(context, chunk),
        ),
      ),
    ),
    (chunks) => new Map<number, readonly ClosingIssue[]>(chunks.flat()),
  );

const WHAT = 'the issues the merged pull requests close';

const CHUNK = 20;

/** The query for `numbers`, each as the variable `$n<index>`. */
const queryOf = (numbers: readonly number[]): string =>
  [
    `query MergedClosingIssues($owner: String!, $name: String!${numbers
      .map((_, index) => `, $n${index}: Int!`)
      .join('')}) {`,
    '  repository(owner: $owner, name: $name) {',
    ...numbers.map(
      (_, index) =>
        `    p${index}: pullRequest(number: $n${index}) { closingIssuesReferences(first: 50) { totalCount nodes { number title url state repository { nameWithOwner } } } }`,
    ),
    '  }',
    '}',
  ].join('\n');

const readChunk = async (
  context: ReadContext,
  numbers: readonly number[],
): Promise<Read<readonly (readonly [number, readonly ClosingIssue[]])[]>> => {
  const read = await graphqlRead(
    context,
    WHAT,
    queryOf(numbers),
    Object.fromEntries(numbers.map((number, index) => [`n${index}`, number])),
    t.record({ repository: t.unknown() }),
  );

  if (Result.isErr(read)) {
    return read;
  }

  const { repository } = read.value;

  const linked = numbers.map(
    (number, index): Read<readonly [number, readonly ClosingIssue[]]> => {
      const alias = `p${index}` as const;

      const pull = LinkedSchema.validate(
        isRecord(repository) && hasKey(repository, alias)
          ? repository[alias]
          : undefined,
      );

      if (Result.isErr(pull)) {
        return Result.err(
          malformed(WHAT, t.validationErrorsToMessages(pull.value).join('; ')),
        );
      }

      // A number that is no pull request (deleted, or never one) links nothing.
      const references = pull.value?.closingIssuesReferences;

      if (references === undefined) {
        return Result.ok([number, []] as const);
      }

      if (references.totalCount > references.nodes.length) {
        return Result.err(
          malformed(
            `the closing issues of #${number}`,
            `${references.totalCount} linked, ${references.nodes.length} read`,
          ),
        );
      }

      return Result.ok([
        number,
        references.nodes
          .filter(({ repository: { nameWithOwner } }) =>
            isContextRepository(nameWithOwner, context),
          )
          .map(({ number: issue, title, url, state }): ClosingIssue => ({
            number: issue,
            title,
            url,
            state: state === 'OPEN' ? 'open' : 'closed',
          })),
      ] as const);
    },
  );

  return allRead(linked);
};

const LinkedSchema = t.union([
  t.nullType,
  t.undefinedType,
  t.record({
    closingIssuesReferences: t.record({
      totalCount: t.number(),
      nodes: t.array(
        t.record({
          number: t.number(),
          title: t.string(),
          url: t.string(),
          state: t.string(),
          repository: t.record({ nameWithOwner: t.string() }),
        }),
      ),
    }),
  }),
]);
