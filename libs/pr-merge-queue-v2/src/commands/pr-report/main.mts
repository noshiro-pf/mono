/**
 * `pr-report`: reads, decides and prints; writes nothing, so it runs with a
 * read-only token or none. Over REST alone, as a Claude Code session's proxy
 * allows (`spec/commands.md`).
 */

import {
  branchTipsNotRead,
  decideQueue,
  OPEN_PULLS_PATH,
  readContextOf,
  readSnapshotRest,
  requirementsOfRules,
  restLeadingItems,
  type BranchRequirements,
  type ReadError,
  type RepoRef,
  type Snapshot,
  type Transport,
} from 'pr-report-core-v2';
import { Result, unknownToString } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { ReadonlyRecord, StrictOmit } from 'ts-type-forge';
import { resolveRepo, resolveToken } from '../../github/index.mjs';
import type { Options } from './options.mjs';
import { renderMarkdown, renderTerminal } from './render.mjs';
import { buildReport, type PrReport } from './report.mjs';

/** What the command reads the world through; a test passes recorded ones. */
export type PrReportWorld = Readonly<{
  transport: Transport;
  env: ReadonlyRecord<string, string | undefined>;
  nowEpochMs: number;
  originUrl: () => Promise<string | undefined>;
  manifestUrl: () => Promise<string | undefined>;
  /** The checkout's `repo-settings/rulesets/main.json`, if it has one. */
  declaredRuleset: () => Promise<string | undefined>;
  /** `gh auth token`, asked only when the environment holds no token. */
  ghAuthToken: () => Promise<Result<string, string>>;
  /** Where a line that does not stop the report goes: standard error. */
  warn: (line: string) => void;
}>;

/** The report, printed in `options.format`, or why there is none. */
export const prReport = async (
  options: Options,
  world: PrReportWorld,
): Promise<Result<string, string>> => {
  const report = await readReport(options, world);

  return Result.map(report, (read) => print(read, options.format));
};

/** The report itself, for a command that reads it rather than prints it. */
export const readReport = async (
  options: StrictOmit<Options, 'format'>,
  world: PrReportWorld,
): Promise<Result<PrReport, string>> => {
  const repo = await resolveRepo(options.repo, world);

  if (Result.isErr(repo)) {
    return repo;
  }

  // Local and cheap, so a declaration that does not parse fails before any
  // request is spent.
  const declared = await declaredRequirements(options.repo, repo.value, world);

  if (Result.isErr(declared)) {
    return declared;
  }

  const token = await resolveToken(world.env, world.ghAuthToken);

  if (Result.isErr(token)) {
    world.warn(
      `${token.value}; reading anonymously, at 60 requests an hour, which runs out at about five pull requests`,
    );
  }

  const context = readContextOf({
    transport: world.transport,
    owner: repo.value.owner,
    name: repo.value.name,
    // None at all reads anonymously, which the report says.
    token: Result.unwrapOkOr(token, undefined),
  });

  // Counted before the snapshot fans out to a dozen requests for each. The cap
  // is this command's, so the reader does not carry it; the count costs a page
  // or two that the snapshot then reads again.
  const open = await restLeadingItems(
    context,
    'the open pull requests',
    OPEN_PULLS_PATH,
    t.array(t.unknown()),
    () => true,
    MAX_OPEN_PULLS + 1,
  );

  if (Result.isErr(open)) {
    return Result.err(messageOf(open.value));
  }

  if (open.value.items.length > MAX_OPEN_PULLS) {
    return Result.err(
      `more than ${MAX_OPEN_PULLS} pull requests are open, which is more than a report covers`,
    );
  }

  const snapshot = await readSnapshotRest(context, {
    nowEpochMs: world.nowEpochMs,
    issuesLimit: options.issuesLimit,
    mergedLimit: options.mergedLimit,
    mergedDays: options.mergedDays,
    follow: [],
    readBranchTips: branchTipsNotRead,
  });

  if (Result.isErr(snapshot)) {
    return Result.err(messageOf(snapshot.value));
  }

  // The snapshot read what GitHub enforces too, two requests, so that one reader
  // serves every command. A declaration replaces all of it, classic protection
  // included: the desired state is what the report judges by.
  const read: Snapshot =
    declared.value === undefined
      ? snapshot.value
      : ({
          ...snapshot.value,
          requirements: Result.ok(declared.value),
        } as const);

  const decision = decideQueue(read, {
    nowEpochMs: world.nowEpochMs,
    demoted: new Set<number>(),
  });

  if (Result.isErr(decision)) {
    return Result.err(messageOf(decision.value));
  }

  return Result.mapErr(
    buildReport(read, decision.value, {
      nowEpochMs: world.nowEpochMs,
      mergedWithinDays: options.mergedDays,
      issuesLimit: options.issuesLimit,
    }),
    messageOf,
  );
};

/**
 * What the checkout declares in `repo-settings/rulesets/main.json`, the desired
 * state, when the report is of the checkout's own repository
 * (`spec/decisions.md`, "Required contexts"); `undefined` for another
 * repository, or a checkout that declares none. A declaration that does not
 * parse is the error, not a silent fall back to what GitHub enforces.
 */
export const declaredRequirements = async (
  option: string | undefined,
  repo: RepoRef,
  world: PrReportWorld,
): Promise<Result<BranchRequirements | undefined, string>> => {
  if (option !== undefined) {
    const checkout = await resolveRepo(undefined, world);

    if (Result.isErr(checkout) || !isSameRepo(checkout.value, repo)) {
      return Result.ok(undefined);
    }
  }

  const text = await world.declaredRuleset();

  if (text === undefined) {
    return Result.ok(undefined);
  }

  const parsed = Result.fromThrowable((): unknown => JSON.parse(text));

  if (Result.isErr(parsed)) {
    return Result.err(
      `${RULESET_PATH} does not parse: ${unknownToString(parsed.value)}`,
    );
  }

  const ruleset = RulesetSchema.validate(parsed.value);

  return Result.isErr(ruleset)
    ? Result.err(
        `${RULESET_PATH} does not parse: ${t.validationErrorsToMessages(ruleset.value).join('; ')}`,
      )
    : Result.ok(requirementsOfRules(ruleset.value.rules));
};

/** Whether `a` and `b` name one repository: GitHub ignores the case of both. */
export const isSameRepo = (a: RepoRef, b: RepoRef): boolean =>
  a.owner.toLowerCase() === b.owner.toLowerCase() &&
  a.name.toLowerCase() === b.name.toLowerCase();

/** A read error as the one line the command fails with. */
export const messageOf = (error: ReadError): string =>
  `cannot read ${error.what} (${error.kind}): ${error.message}` as const;

/** Where a repository declares its default branch's ruleset. */
export const RULESET_PATH = 'repo-settings/rulesets/main.json';

/**
 * How many open pull requests a report covers: each fans out to a dozen
 * requests, and past this one run spends most of an hour's rate limit.
 */
export const MAX_OPEN_PULLS = 100;

const RulesetSchema = t.record({ rules: t.array(t.unknown()) });

const print = (report: PrReport, format: Options['format']): string => {
  switch (format) {
    case 'json':
      return JSON.stringify(report, undefined, 2);

    case 'markdown':
      return renderMarkdown(report);

    case 'terminal':
      return renderTerminal(report);
  }
};
