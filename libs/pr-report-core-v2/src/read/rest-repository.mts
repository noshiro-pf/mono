/**
 * What holds for the whole repository, over REST: the default branch and its
 * tip, the token's account, `CODEOWNERS`, the queue label, and what GitHub
 * enforces on the default branch (`decisions.md`, "Required contexts").
 */

import { Arr, hasKey, isRecord, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { PullRequestLabel } from '../conventions/index.mjs';
import type {
  BranchRequirements,
  Read,
  RepositoryFacts,
} from '../snapshot/index.mjs';
import { isNotFound, malformed, skipped } from './classify.mjs';
import { pathSegment, restAllPages, restGet } from './rest.mjs';
import type { ReadContext } from './transport.mjs';

/**
 * The repository's facts, `repo` named as GitHub answers now (a renamed one
 * answers its old name too). The tip of the default branch is not a part:
 * unread, there is no snapshot, so this is unread with it.
 */
export const readRepositoryFacts = async (
  context: ReadContext,
): Promise<Read<RepositoryFacts>> => {
  const repository = await readNamedRepository(context);

  if (Result.isErr(repository)) {
    return repository;
  }

  const { named, defaultBranch } = repository.value;

  const [tip, viewer, codeOwners, hasQueueLabel] = await Promise.all([
    restGet(
      named,
      `the tip of ${defaultBranch}`,
      `/git/ref/heads/${pathSegment(defaultBranch)}`,
      t.record({ object: t.record({ sha: t.string() }) }),
    ),
    readViewer(named),
    readCodeOwners(named, defaultBranch),
    readHasLabel(named, PullRequestLabel.mergeQueued),
  ]);

  return Result.map(tip, ({ object }) => ({
    repo: { owner: named.owner, name: named.name },
    defaultBranch,
    defaultBranchTip: object.sha,
    viewer,
    codeOwners,
    hasQueueLabel,
  }));
};

/**
 * What GitHub enforces on `branch`: every ruleset rule, paged to the end, and a
 * classic protection rule's contexts unless it is disabled or `off`. Either
 * request failing fails the read.
 */
export const readRequirements = async (
  context: ReadContext,
  branch: string,
): Promise<Read<BranchRequirements>> => {
  const segment = pathSegment(branch);

  const [rules, branchAnswer] = await Promise.all([
    restAllPages(
      context,
      `the rules on ${branch}`,
      `/rules/branches/${segment}`,
      t.array(t.unknown()),
    ),
    restGet(
      context,
      `the protection of ${branch}`,
      `/branches/${segment}`,
      BranchSchema,
    ),
  ]);

  if (Result.isErr(rules)) {
    return rules;
  }

  if (Result.isErr(branchAnswer)) {
    return branchAnswer;
  }

  const fromRules = requirementsOfRules(rules.value);

  const { protection } = branchAnswer.value;

  const classic =
    protection?.enabled === false
      ? undefined
      : protection?.required_status_checks;

  return Result.ok({
    ...fromRules,
    requiredContexts: Arr.uniq([
      ...fromRules.requiredContexts,
      ...(classic === undefined || classic.enforcement_level === 'off'
        ? []
        : classic.contexts),
    ]),
  });
};

/**
 * What the rules of a branch require; a rule of another type or of an
 * unexpected shape adds nothing.
 */
export const requirementsOfRules = (
  rules: readonly unknown[],
): BranchRequirements => {
  const parameters = (type: string): readonly unknown[] =>
    Arr.generate(function* () {
      for (const rule of rules) {
        if (
          isRecord(rule) &&
          hasKey(rule, 'type') &&
          rule.type === type &&
          hasKey(rule, 'parameters')
        ) {
          yield rule.parameters;
        }
      }
    });

  const flag = (key: string): boolean =>
    parameters('pull_request').some(
      (each) => isRecord(each) && hasKey(each, key) && each[key] === true,
    );

  return {
    requiredContexts: Arr.uniq(
      parameters('required_status_checks').flatMap((each) => {
        const decoded = StatusChecksSchema.validate(each);

        return Result.isOk(decoded)
          ? decoded.value.required_status_checks.map(
              ({ context: name }) => name,
            )
          : [];
      }),
    ),
    requireCodeOwnerReview: flag('require_code_owner_review'),
    requireConversationResolution: flag('required_review_thread_resolution'),
  };
};

const BranchSchema = t.record({
  protection: t.optional(
    t.record({
      enabled: t.optional(t.boolean()),
      required_status_checks: t.optional(
        t.record({
          enforcement_level: t.optional(t.string()),
          contexts: t.array(t.string()),
        }),
      ),
    }),
  ),
});

const StatusChecksSchema = t.record({
  required_status_checks: t.array(t.record({ context: t.string() })),
});

/**
 * The context as GitHub names the repository now, and its default branch: a
 * renamed one answers its old name by a redirect, and what is read after names
 * the new.
 */
export const readNamedRepository = async (
  context: ReadContext,
): Promise<Read<Readonly<{ named: ReadContext; defaultBranch: string }>>> => {
  const repository = await restGet(
    context,
    'the repository',
    '',
    t.record({ full_name: t.string(), default_branch: t.string() }),
  );

  if (Result.isErr(repository)) {
    return repository;
  }

  const [owner, name] = repository.value.full_name.split('/', 2);

  return owner === undefined || name === undefined
    ? Result.err(
        malformed('the repository', `full_name ${repository.value.full_name}`),
      )
    : Result.ok({
        named: { ...context, owner, name },
        defaultBranch: repository.value.default_branch,
      });
};

/** The login the token authenticates as; `skipped` without a token. */
export const readViewer = async (
  context: ReadContext,
): Promise<Read<string>> =>
  context.token === undefined
    ? Result.err(skipped('the account of the token', 'read without a token'))
    : Result.map(
        await restGet(
          context,
          'the account of the token',
          'https://api.github.com/user',
          t.record({ login: t.string() }),
        ),
        ({ login }) => login,
      );

/**
 * Base64 (GitHub wraps it in lines) to text, with what the browser has too: the
 * page reads `CODEOWNERS` through the same reader, where there is no `Buffer`.
 */
const utf8OfBase64 = (base64: string): string => {
  const decoder = new TextDecoder();

  return decoder.decode(
    Uint8Array.from(
      Array.from(
        // Line breaks and all: `atob` skips ASCII whitespace.
        atob(base64),
        (char) => char.codePointAt(0) ?? 0,
      ),
    ),
  );
};

/** `.github/CODEOWNERS` on `branch`; a 404 is none. */
const readCodeOwners = async (
  context: ReadContext,
  branch: string,
): Promise<Read<string | undefined>> => {
  const read = await restGet(
    context,
    'CODEOWNERS',
    `/contents/.github/CODEOWNERS?ref=${pathSegment(branch)}`,
    t.record({ content: t.string(), encoding: t.string() }),
  );

  if (Result.isErr(read)) {
    return isNotFound(read.value) ? Result.ok(undefined) : read;
  }

  if (read.value.encoding !== 'base64') {
    return Result.ok(read.value.content);
  }

  const text = Result.fromThrowable(() => utf8OfBase64(read.value.content));

  return Result.isErr(text)
    ? Result.err(malformed('CODEOWNERS', text.value.message))
    : text;
};

/** Whether the repository has the label at all; a 404 is no. */
const readHasLabel = async (
  context: ReadContext,
  label: string,
): Promise<Read<boolean>> => {
  const read = await restGet(
    context,
    `the ${label} label`,
    `/labels/${pathSegment(label)}`,
    t.record({ name: t.string() }),
  );

  return Result.isErr(read)
    ? isNotFound(read.value)
      ? Result.ok(false)
      : read
    : Result.ok(true);
};
