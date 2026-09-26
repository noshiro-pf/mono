// cspell:ignore retarget retargeted

/** Everything that shells out to `gh` or `git`, and nothing that decides. */

import {
  describeSetAside,
  MERGE_QUEUED_LABEL,
  SET_ASIDE_CONTEXT,
  SKIP_CI_LABEL,
  type SetAside,
} from 'pr-report-core';
import { Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { $ } from 'ts-repo-utils';
import { projectRootPath } from '../../project-root-path.mjs';
import {
  PullRequestListSchema,
  PullRequestSchema,
  type NativeStackEntry,
  type PullRequest,
  type TimelineEvent,
} from './types.mjs';
import { isSafeRefName, sh } from './util.mjs';

const PR_JSON_FIELDS =
  'number,id,title,body,state,headRefName,headRefOid,baseRefName,isCrossRepository,isDraft,mergeStateStatus,autoMergeRequest,labels';

/**
 * Passed to every git and gh invocation. `GIT_TERMINAL_PROMPT=0` turns a
 * missing credential into a failure instead of a hang; `GIT_EDITOR=true`
 * keeps any editor git might want out of the way.
 */
const childEnv: NodeJS.ProcessEnv = {
  ...process.env,
  GIT_TERMINAL_PROMPT: '0',
  GIT_EDITOR: 'true',
} as const;

export const checkPreflight = async (): Promise<
  Result<Readonly<{ defaultBranch: string }>, string>
> => {
  const auth = await git('gh auth status');

  if (Result.isErr(auth)) {
    return Result.err(`gh is not authenticated:\n${auth.value}`);
  }

  const defaultBranch = await git(
    'gh repo view --json defaultBranchRef --jq .defaultBranchRef.name',
  );

  if (Result.isErr(defaultBranch)) {
    return Result.err(`cannot read the default branch: ${defaultBranch.value}`);
  }

  const name = defaultBranch.value.trim();

  if (!isSafeRefName(name)) {
    return Result.err(
      `unexpected default branch name: ${JSON.stringify(name)}`,
    );
  }

  return Result.ok({ defaultBranch: name });
};

export const listPullRequests = async (): Promise<
  Result<readonly PullRequest[], string>
> => {
  const listed = await git(
    `gh pr list --state open --limit 100 --json ${PR_JSON_FIELDS}`,
  );

  return Result.isErr(listed)
    ? listed
    : parseJson(listed.value, PullRequestListSchema);
};

export const viewPullRequest = async (
  prNumber: number,
): Promise<Result<PullRequest, string>> => {
  const viewed = await git(`gh pr view ${prNumber} --json ${PR_JSON_FIELDS}`);

  return Result.isErr(viewed)
    ? viewed
    : parseJson(viewed.value, PullRequestSchema);
};

/**
 * `REVIEW_REQUIRED`, `CHANGES_REQUESTED`, `APPROVED`, or empty when the
 * rules ask for no review. Read only when a green pull request will not
 * merge, to say what holds it.
 */
export const viewReviewDecision = async (
  prNumber: number,
): Promise<Result<string, string>> => {
  const viewed = await git(
    `gh pr view ${prNumber} --json reviewDecision --jq .reviewDecision`,
  );

  return Result.isErr(viewed) ? viewed : Result.ok(viewed.value.trim());
};

export const remoteSha = async (
  branch: string,
): Promise<Result<string, string>> => {
  const listed = await git(`git ls-remote --heads origin ${sh(branch)}`);

  if (Result.isErr(listed)) {
    return listed;
  }

  const sha = listed.value.trim().split(/\s+/u, 1)[0];

  return sha === undefined || sha === ''
    ? Result.err(`origin has no branch named ${branch}`)
    : Result.ok(sha);
};

export const addSkipCiLabel = async (
  prNumber: number,
): Promise<Result<undefined, string>> => {
  const added = await git(
    `gh pr edit ${prNumber} --add-label ${sh(SKIP_CI_LABEL)}`,
  );

  return Result.isErr(added) ? added : Result.ok(undefined);
};

/**
 * Leaves a `failure` commit status on the head a pull request was set aside
 * at, saying why and against which base. `pr-report-core`'s `set-aside.mts`
 * says what reads it and why it is a status rather than a label or a
 * comment.
 */
export const postSetAsideStatus = async (
  headSha: string,
  setAside: SetAside,
  /** Where the status's "Details" leads; GitHub shows no link without one. */
  targetUrl: string | undefined,
): Promise<Result<undefined, string>> => {
  if (!SHA.test(headSha)) {
    return Result.err(`unexpected head SHA: ${JSON.stringify(headSha)}`);
  }

  const posted = await git(
    [
      'gh api --method POST',
      // `{owner}` and `{repo}` are `gh api`'s placeholders for the
      // repository of the working directory, not interpolations.
      sh([STATUSES_ROUTE, headSha].join('/')),
      '-f state=failure',
      `-f ${sh(`context=${SET_ASIDE_CONTEXT}`)}`,
      `-f ${sh(`description=${describeSetAside(setAside)}`)}`,
      ...(targetUrl === undefined
        ? []
        : [`-f ${sh(`target_url=${targetUrl}`)}`]),
    ].join(' '),
  );

  return Result.isErr(posted) ? posted : Result.ok(undefined);
};

/**
 * What the pull request's timeline says about its base, its auto-merge and
 * its being queued, oldest first: `stack.mts` reads which branch GitHub moved
 * it off, and `auto-merge.mts` whether a person disarmed it since it was
 * queued.
 *
 * GraphQL, because the REST timeline does not say which branches a change of
 * base was between. Enabling auto-merge is three event types, one per merge
 * method; a label other than `merge-queued` is dropped.
 */
export const readTimeline = async (
  prNumber: number,
): Promise<Result<readonly TimelineEvent[], string>> => {
  const answered = await git(
    [
      'gh api graphql',
      // `gh` fills these two placeholders in from the working directory's
      // repository.
      `-F ${sh('owner={owner}')}`,
      `-F ${sh('repo={repo}')}`,
      `-F number=${prNumber}`,
      `-f ${sh(`query=${TIMELINE_QUERY}`)}`,
    ].join(' '),
  );

  if (Result.isErr(answered)) {
    return answered;
  }

  const parsed = parseJson(answered.value, TimelineSchema);

  if (Result.isErr(parsed)) {
    return parsed;
  }

  return Result.ok(
    parsed.value.data.repository.pullRequest.timelineItems.nodes.flatMap(
      toTimelineEvents,
    ),
  );
};

const toTimelineEvents = (
  node: t.TypeOf<typeof TimelineNodeSchema>,
): readonly TimelineEvent[] => {
  switch (node.__typename) {
    case 'BaseRefChangedEvent':
      return [
        {
          kind: 'base-changed',
          from: node.previousRefName ?? '',
          to: node.currentRefName ?? '',
        },
      ];

    case 'AutoMergeDisabledEvent':
      return [
        {
          kind: 'auto-merge-disabled',
          manually: node.reasonCode === 'manually_disabled',
        },
      ];

    case 'LabeledEvent':
      return node.label?.name === MERGE_QUEUED_LABEL
        ? [{ kind: 'queued' }]
        : [];

    default:
      return [{ kind: 'auto-merge-enabled' }];
  }
};

const TIMELINE_QUERY = [
  'query($owner: String!, $repo: String!, $number: Int!) {',
  '  repository(owner: $owner, name: $repo) {',
  '    pullRequest(number: $number) {',
  '      timelineItems(last: 100, itemTypes: [BASE_REF_CHANGED_EVENT, AUTO_MERGE_ENABLED_EVENT, AUTO_SQUASH_ENABLED_EVENT, AUTO_REBASE_ENABLED_EVENT, AUTO_MERGE_DISABLED_EVENT, LABELED_EVENT]) {',
  '        nodes {',
  '          __typename',
  '          ... on BaseRefChangedEvent { previousRefName currentRefName }',
  '          ... on AutoMergeDisabledEvent { reasonCode }',
  '          ... on LabeledEvent { label { name } }',
  '        }',
  '      }',
  '    }',
  '  }',
  '}',
].join(' ');

const TimelineNodeSchema = t.record({
  __typename: t.string(),
  previousRefName: t.optional(t.union([t.string(), t.nullType])),
  currentRefName: t.optional(t.union([t.string(), t.nullType])),
  reasonCode: t.optional(t.union([t.string(), t.nullType])),
  label: t.optional(t.union([t.record({ name: t.string() }), t.nullType])),
});

const TimelineSchema = t.record({
  data: t.record({
    repository: t.record({
      pullRequest: t.record({
        timelineItems: t.record({
          nodes: t.array(TimelineNodeSchema),
        }),
      }),
    }),
  }),
});

/**
 * The pull request's place in one of GitHub's native stacks, or `undefined`
 * when it is in none. GraphQL, because `gh pr view` does not know them.
 */
export const readNativeStack = async (
  prNumber: number,
): Promise<Result<NativeStackEntry | undefined, string>> => {
  const answered = await git(
    [
      'gh api graphql',
      `-F ${sh('owner={owner}')}`,
      `-F ${sh('repo={repo}')}`,
      `-F number=${prNumber}`,
      `-f ${sh(`query=${NATIVE_STACK_QUERY}`)}`,
    ].join(' '),
  );

  if (Result.isErr(answered)) {
    return answered;
  }

  const parsed = parseJson(answered.value, NativeStackSchema);

  if (Result.isErr(parsed)) {
    return parsed;
  }

  const entry = parsed.value.data.repository.pullRequest.stackEntry;

  return Result.ok(
    entry === null
      ? undefined
      : {
          stack: entry.stack.number,
          position: entry.position,
          size: entry.stack.size,
        },
  );
};

const NATIVE_STACK_QUERY = [
  'query($owner: String!, $repo: String!, $number: Int!) {',
  '  repository(owner: $owner, name: $repo) {',
  '    pullRequest(number: $number) {',
  '      stackEntry { position stack { number size } }',
  '    }',
  '  }',
  '}',
].join(' ');

const NativeStackSchema = t.record({
  data: t.record({
    repository: t.record({
      pullRequest: t.record({
        stackEntry: t.union([
          t.record({
            position: t.number(),
            stack: t.record({ number: t.number(), size: t.number() }),
          }),
          t.nullType,
        ]),
      }),
    }),
  }),
});

/**
 * The head the last merged pull request from `branch` was merged at, or
 * `undefined` when none was — the layer a retargeted pull request was
 * stacked on, whose commits it may still carry.
 */
export const mergedHeadOf = async (
  branch: string,
): Promise<Result<MergedHead | undefined, string>> => {
  const listed = await git(
    `gh pr list --state merged --head ${sh(branch)} --limit 5 --json number,headRefOid,mergedAt`,
  );

  if (Result.isErr(listed)) {
    return listed;
  }

  const parsed = parseJson(listed.value, MergedHeadListSchema);

  if (Result.isErr(parsed)) {
    return parsed;
  }

  const [latest] = parsed.value.toSorted((a, b) =>
    b.mergedAt.localeCompare(a.mergedAt),
  );

  return Result.ok(
    latest === undefined
      ? undefined
      : { number: latest.number, headSha: latest.headRefOid },
  );
};

export type MergedHead = Readonly<{ number: number; headSha: string }>;

const MergedHeadListSchema = t.array(
  t.record({
    number: t.number(),
    headRefOid: t.string(),
    mergedAt: t.string(),
  }),
);

/**
 * Arms auto-merge, squash being the one method the ruleset allows. The
 * mutation rather than `gh pr merge --auto`, which merges on the spot when
 * nothing holds the pull request; this one refuses instead.
 */
export const armAutoMerge = async (
  nodeId: string,
): Promise<Result<undefined, string>> => {
  const armed = await git(
    [
      'gh api graphql',
      `-f ${sh(`id=${nodeId}`)}`,
      `-f ${sh(`query=${ARM_MUTATION}`)}`,
    ].join(' '),
  );

  return Result.isErr(armed) ? armed : Result.ok(undefined);
};

const ARM_MUTATION =
  'mutation($id: ID!) { enablePullRequestAutoMerge(input: { pullRequestId: $id, mergeMethod: SQUASH }) { clientMutationId } }';

const SHA = /^[0-9a-f]{40}$/u;

const STATUSES_ROUTE = 'repos/{owner}/{repo}/statuses';

/**
 * Runs a git or gh command silently and resolves to its stdout, or to a
 * message that includes what it printed to stderr.
 */
export const git = async (
  command: string,
  cwd: string = projectRootPath,
): Promise<Result<string, string>> => {
  const result = await $(command, {
    cwd,
    silent: true,
    env: childEnv,
    maxBuffer: 64 * 1024 * 1024,
  });

  return Result.isOk(result)
    ? Result.ok(result.value.stdout)
    : Result.err(result.value.message.trim());
};

export const parseJson = <A,>(
  text: string,
  schema: t.Type<A>,
): Result<A, string> => {
  const parsed = Json.parse(text);

  if (Result.isErr(parsed)) {
    return Result.err(`invalid JSON: ${parsed.value}`);
  }

  const validated = schema.validate(parsed.value);

  return Result.isErr(validated)
    ? Result.err(t.validationErrorsToMessages(validated.value).join('\n'))
    : Result.ok(validated.value);
};
