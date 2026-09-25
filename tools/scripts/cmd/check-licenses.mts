import { execFileSync } from 'node:child_process';
import { Arr, Json, Result, unknownToString } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { isDirectlyExecuted } from 'ts-repo-utils';
import {
  licensePolicy,
  type LicensePolicy,
} from '../../configs/license-policy.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when an installed dependency carries a license the policy in
 * `tools/configs/license-policy.mts` does not let through. `--report` prints
 * what is installed against that policy instead, and never fails on it.
 *
 * This is what holds the `pnpm-update` pull request when an update changes a
 * license: that pull request auto-merges on green, this runs in `check:root`,
 * and `code-check-result / result` is required. Nothing in `pnpm-update.yml` knows
 * about licenses, and nothing has to — the job there that holds the key runs
 * nothing from the tree, and this way it still does not.
 *
 * **An allow-list rather than a comparison with the previous state**, which is
 * what "block when a license changes" first suggests. A comparison needs the
 * previous state to be somewhere: a committed snapshot of every package
 * changes whenever a transitive dependency appears, so the block becomes
 * routine and stops being read; one computed inside the workflow has to be
 * carried into the job that opens the pull request, and an approval has to be
 * remembered or the next run blocks again. The list has no state, the
 * approval is an edit to it on `main`, and it catches the relicensing that
 * happens in practice — an open-source license replaced by BUSL, SSPL or a
 * custom text lands outside any allow-list. What it lets through unremarked
 * is a move _within_ the list (MIT to Apache-2.0), where there is nothing to
 * do about it anyway.
 *
 * It reads `pnpm licenses list --json`, which reads the installed
 * `node_modules` and the network not at all. Without an install every package
 * comes back `Unknown`, so `Unknown` is a failure rather than a gap: a check
 * that passes because it saw nothing is the one shape this must not have.
 */
export const checkLicenses = (): Result<CheckSummary, string> => {
  const installed = readInstalledLicenses();

  if (Result.isErr(installed)) {
    return installed;
  }

  const violations = collectViolations(installed.value, licensePolicy);

  return Arr.isNonEmpty(violations)
    ? Result.err(formatViolations(violations))
    : Result.ok({
        packageCount: installed.value.length,
        licenseCount: Arr.uniq(installed.value.map(({ license }) => license))
          .length,
        exceptionCount: licensePolicy.exceptions.length,
      });
};

/**
 * One entry per package and license from `pnpm licenses list --json`, which
 * groups by license: `{ "MIT": [{ name, versions, license, … }], … }`.
 *
 * A package whose versions disagree appears once under each license
 * (`argparse` is Python-2.0 at 2.x and PSF-2.0 at 3.x), so the pair is the
 * unit and not the name.
 */
export const parseLicensesOutput = (
  output: string,
): Result<readonly InstalledLicense[], string> => {
  const parsed = Json.parse(output);

  if (Result.isErr(parsed)) {
    return Result.err(
      `\`pnpm licenses list --json\` returned no JSON: ${parsed.value}`,
    );
  }

  const groups = PNPM_LICENSES.validate(parsed.value);

  if (Result.isErr(groups)) {
    return Result.err(
      Arr.toUnshifted(
        '`pnpm licenses list --json` returned something other than packages grouped by license:',
      )(t.validationErrorsToMessages(groups.value)).join('\n'),
    );
  }

  const installed = Object.entries(groups.value).flatMap(
    ([license, packages]) =>
      packages.map(({ name, versions }) => ({ name, license, versions })),
  );

  return Arr.isNonEmpty(installed)
    ? Result.ok(installed)
    : Result.err(
        '`pnpm licenses list --json` listed no package, so there is nothing to have checked.',
      );
};

/**
 * `true` when the SPDX expression can be satisfied from `allowed`.
 *
 * `OR` is the licensee's choice, so one allowed alternative is enough; `AND`
 * binds to every part. That is as far as this reads: nesting, `WITH` and
 * anything else are answered `false`, which sends the package to the
 * exceptions where a person reads the expression.
 */
export const isAllowedExpression = (
  expression: string,
  allowed: ReadonlySet<string>,
): boolean => {
  const trimmed = expression.trim();

  const inner =
    trimmed.startsWith('(') && trimmed.endsWith(')')
      ? trimmed.slice(1, -1)
      : trimmed;

  if (inner.includes('(') || inner.includes(')')) {
    return false;
  }

  return inner
    .split(' OR ')
    .some((alternative) =>
      alternative.split(' AND ').every((part) => allowed.has(part.trim())),
    );
};

/**
 * `true` when an exception's package pattern speaks for `name`: the name
 * itself, or with a trailing `*` every name that continues the prefix.
 *
 * The `*` is for per-platform binaries (`lightningcss-linux-x64-gnu`), of
 * which an install has only its own platform's — a list of exact names would
 * be stale on every machine but one.
 */
export const matchesPackagePattern = (
  pattern: string,
  name: string,
): boolean =>
  pattern.endsWith(WILDCARD)
    ? name.length >= pattern.length && name.startsWith(pattern.slice(0, -1))
    : name === pattern;

/** Everything the policy does not let through, and every exception it no longer needs. */
export const collectViolations = (
  installed: readonly InstalledLicense[],
  policy: LicensePolicy,
): readonly Violation[] => {
  const allowed = allowedSetOf(policy);

  const notLetThrough = installed.flatMap((entry): readonly Violation[] => {
    if (
      isExcepted(entry, policy) ||
      isAllowedExpression(entry.license, allowed)
    ) {
      return [];
    }

    const subject =
      `${entry.name}@${entry.versions.join(' | ')} (${entry.license})` as const;

    if (entry.license === UNKNOWN_LICENSE) {
      return [{ subject, message: REASONS.unknown }];
    }

    const previous = policy.exceptions.find(({ packages }) =>
      packages.some((pattern) => matchesPackagePattern(pattern, entry.name)),
    );

    return [
      {
        subject,
        message:
          previous === undefined
            ? REASONS['not-allowed']
            : `${REASONS.changed} The exception was written for ${previous.license}.`,
      },
    ];
  });

  const stale = policy.exceptions.flatMap(({ license, packages }) =>
    packages.flatMap((pattern): readonly Violation[] =>
      installed.some(
        (entry) =>
          entry.license === license &&
          matchesPackagePattern(pattern, entry.name),
      )
        ? []
        : [
            {
              subject: `exception '${pattern}' (${license})`,
              message: REASONS['stale-exception'],
            },
          ],
    ),
  );

  return [...notLetThrough, ...stale];
};

/**
 * The installed licenses as a Markdown table, most common first, each with
 * what the policy says about it. A license the policy does not cover is
 * marked rather than left out — this is the view for deciding what to do
 * about one.
 */
export const formatReport = (
  installed: readonly InstalledLicense[],
  policy: LicensePolicy,
): string => {
  const allowed = allowedSetOf(policy);

  const licenses = Arr.uniq(installed.map(({ license }) => license)).map(
    (license) => ({
      license,
      entries: installed.filter((entry) => entry.license === license),
    }),
  );

  const rows = licenses
    .toSorted((a, b) => b.entries.length - a.entries.length)
    .map(({ license, entries }) => {
      const notes = policy.exceptions
        .filter((exception) => exception.license === license)
        .map(({ packages, reason }) => {
          const names = entries
            .filter(({ name }) =>
              packages.some((pattern) => matchesPackagePattern(pattern, name)),
            )
            .map(({ name }) => `\`${name}\``);

          return `${names.join(', ')}: ${reason}`;
        });

      const uncovered = entries
        .filter(
          (entry) =>
            !isExcepted(entry, policy) &&
            !isAllowedExpression(entry.license, allowed),
        )
        .map(({ name }) => `\`${name}\``);

      const status = Arr.isNonEmpty(uncovered)
        ? 'NOT ALLOWED'
        : Arr.isNonEmpty(notes)
          ? 'exception'
          : 'allowed';

      const note =
        policy.allowed.find((entry) => entry.license === license)?.note ??
        (isAllowedExpression(license, allowed)
          ? 'A choice that includes an allowed license.'
          : '');

      const cell = [
        ...notes,
        ...(Arr.isNonEmpty(uncovered) ? [uncovered.join(', ')] : []),
        ...(note === '' ? [] : [note]),
      ].join(' ');

      return `| ${license} | ${entries.length} | ${status} | ${cell} |`;
    });

  return [
    '| license | packages | policy | note |',
    '| :-- | --: | :-- | :-- |',
    ...rows,
  ].join('\n');
};

export type InstalledLicense = Readonly<{
  name: string;
  license: string;
  versions: readonly string[];
}>;

export type Violation = Readonly<{
  subject: string;
  message: string;
}>;

type CheckSummary = Readonly<{
  packageCount: number;
  licenseCount: number;
  exceptionCount: number;
}>;

/**
 * What `pnpm licenses list --json` returns, to the extent this reads it.
 * `record` allows excess properties, so the `paths`, `author` and `homepage`
 * each entry also carries need no mention.
 */
const PNPM_LICENSES = t.keyValueRecord(
  t.string(),
  t.array(
    t.record({
      name: t.string(),
      versions: t.array(t.string()),
    }),
  ),
);

const POLICY_FILE = 'tools/configs/license-policy.mts';

const WILDCARD = '*';

/** What pnpm reports for a package with no `license` field — or not installed. */
const UNKNOWN_LICENSE = 'Unknown';

const REPORT_FLAG = '--report';

const REASONS = {
  'not-allowed': [
    'is not a license the policy lets through. If this arrived with a',
    'dependency update, that update is what to look at first. Letting it',
    `through is an exception in ${POLICY_FILE}, written by someone who has`,
    'read the license, saying what the package is used for.',
  ].join(' '),

  changed: [
    'has changed license, so the exception that covered it no longer does.',
    'Read the new license against the use the exception describes before',
    'rewriting it.',
  ].join(' '),

  unknown: [
    'declares no license. If every package reads like this, `node_modules` is',
    'not installed. Otherwise find the license in the package itself and',
    'write an exception naming it — `Unknown` is never the thing to allow.',
  ].join(' '),

  'stale-exception': [
    'matches nothing installed under that license. The dependency is gone or',
    'its license moved; delete the entry, or rewrite it if another line here',
    'reports the move.',
  ].join(' '),
} as const;

const allowedSetOf = (policy: LicensePolicy): ReadonlySet<string> =>
  new Set(policy.allowed.map(({ license }) => license));

const isExcepted = (entry: InstalledLicense, policy: LicensePolicy): boolean =>
  policy.exceptions.some(
    ({ license, packages }) =>
      license === entry.license &&
      packages.some((pattern) => matchesPackagePattern(pattern, entry.name)),
  );

const readInstalledLicenses = (): Result<
  readonly InstalledLicense[],
  string
> => {
  const output = Result.fromThrowable(() =>
    execFileSync('pnpm', ['licenses', 'list', '--json'], {
      cwd: projectRootPath,
      encoding: 'utf8',
      // The listing carries every install path and is several hundred KB.
      maxBuffer: 256 * 1024 * 1024,
    }),
  );

  return Result.isErr(output)
    ? Result.err(
        `\`pnpm licenses list --json\` failed: ${unknownToString(output.value)}`,
      )
    : parseLicensesOutput(output.value);
};

const formatViolations = (violations: readonly Violation[]): string =>
  [
    `${violations.length} license problem(s):`,
    '',
    ...violations.map(({ subject, message }) => `  ${subject} ${message}`),
    '',
    `The policy and how to edit it are in ${POLICY_FILE}; \`pnpm run licenses\``,
    'prints what is installed against it.',
  ].join('\n');

if (isDirectlyExecuted(import.meta.url)) {
  if (process.argv.includes(REPORT_FLAG)) {
    const installed = readInstalledLicenses();

    if (Result.isErr(installed)) {
      console.error(installed.value);

      process.exit(1);
    }

    console.info(formatReport(installed.value, licensePolicy));
  } else {
    const result = checkLicenses();

    if (Result.isErr(result)) {
      console.error(result.value);

      process.exit(1);
    }

    console.info(
      [
        `${result.value.packageCount} installed package(s) under`,
        `${result.value.licenseCount} license(s) are all allowed or covered by one`,
        `of ${result.value.exceptionCount} exception(s), and every exception is`,
        'still in use.',
      ].join(' '),
    );
  }
}
