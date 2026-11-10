/**
 * What holds for the whole repository, over GraphQL, in one query: the default
 * branch and its tip, the token's account, `CODEOWNERS`, the queue label.
 */

import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { PullRequestLabel } from '../conventions/index.mjs';
import type { Read, RepositoryFacts } from '../snapshot/index.mjs';
import { malformed } from './classify.mjs';
import { graphqlRead } from './graphql.mjs';
import type { ReadContext } from './transport.mjs';

/**
 * The repository's facts, `repo` named as GitHub answers now. The parts are one
 * query's: unread, all are, and there is no snapshot.
 */
export const readRepositoryFactsGraphql = async (
  context: ReadContext,
): Promise<Read<RepositoryFacts>> => {
  const read = await graphqlRead(
    context,
    'the repository',
    REPOSITORY_QUERY,
    { label: PullRequestLabel.mergeQueued },
    RepositorySchema,
  );

  if (Result.isErr(read)) {
    return read;
  }

  const { viewer, repository } = read.value;

  const [owner, name] = repository.nameWithOwner.split('/', 2);

  if (
    owner === undefined ||
    name === undefined ||
    repository.defaultBranchRef === null
  ) {
    return Result.err(
      malformed(
        'the repository',
        `${repository.nameWithOwner} without a default branch`,
      ),
    );
  }

  return Result.ok({
    repo: { owner, name },
    defaultBranch: repository.defaultBranchRef.name,
    defaultBranchTip: repository.defaultBranchRef.target.oid,
    viewer: Result.ok(viewer.login),
    codeOwners: Result.ok(repository.codeOwners?.text ?? undefined),
    hasQueueLabel: Result.ok(repository.queueLabel !== null),
  });
};

export const REPOSITORY_QUERY = [
  'query Repository($owner: String!, $name: String!, $label: String!) {',
  '  viewer { login }',
  '  repository(owner: $owner, name: $name) {',
  '    nameWithOwner',
  '    defaultBranchRef { name target { oid } }',
  '    codeOwners: object(expression: "HEAD:.github/CODEOWNERS") { ... on Blob { text } }',
  '    queueLabel: label(name: $label) { name }',
  '  }',
  '}',
].join('\n');

const RepositorySchema = t.record({
  viewer: t.record({ login: t.string() }),
  repository: t.record({
    nameWithOwner: t.string(),
    defaultBranchRef: t.union([
      t.record({ name: t.string(), target: t.record({ oid: t.string() }) }),
      t.nullType,
    ]),
    codeOwners: t.union([
      t.record({ text: t.optional(t.union([t.string(), t.nullType])) }),
      t.nullType,
    ]),
    queueLabel: t.union([t.record({ name: t.string() }), t.nullType]),
  }),
});
