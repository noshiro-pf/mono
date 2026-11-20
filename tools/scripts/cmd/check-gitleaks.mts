import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { Arr, isRecord, Json, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { describeFailure, runFile } from '../lib/child-process.mjs';
import { plural } from '../lib/plural.mjs';
import {
  downloadWithFetch,
  installReleaseBinary,
  platformKey,
  readReleaseBinaryPins,
  releaseBinaryCacheDir,
} from '../lib/release-binaries.mjs';
import { isUnderExperimental, listCheckoutFiles } from '../lib/repo-files.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Runs the pinned gitleaks over every file of the checkout that git does not
 * ignore, `experimental/` aside, and fails on anything it reads as a secret.
 *
 * The files are copied to a directory of their own first, so that gitleaks
 * reads what git would commit and nothing `.gitignore` keeps out
 * (`node_modules/`, `dist/`, a `.env.local`). The working tree, uncommitted
 * changes included, is what is read, as every `check:` reads it; a secret
 * already in the history is not looked for.
 *
 * Secrets are never printed: gitleaks runs with `--redact`, and only the rule,
 * the file and the line are read from its report.
 */
export const checkRepository = async (): Promise<Result<string, string>> => {
  const installed = await installPinnedGitleaks();

  if (Result.isErr(installed)) {
    return installed;
  }

  const files = await listCheckoutFiles({ select: isScanned });

  if (Result.isErr(files)) {
    return files;
  }

  const scanRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'check-gitleaks-'));

  try {
    const findings = await scanFiles({
      gitleaks: installed.value.binary,
      root: projectRootPath,
      files: files.value,
      scanRoot,
    });

    if (Result.isErr(findings)) {
      return findings;
    }

    return Arr.isNonEmpty(findings.value)
      ? Result.err(describeFindings(findings.value, installed.value.version))
      : Result.ok(
          `Nothing that reads as a secret in ${plural(files.value.length, 'file')} (gitleaks ${installed.value.version}).`,
        );
  } finally {
    await fs.rm(scanRoot, { recursive: true, force: true });
  }
};

/** Whether a file of the checkout is scanned: all but `experimental/`. */
export const isScanned = (relativePath: string): boolean =>
  !isUnderExperimental(relativePath);

/**
 * The findings of a gitleaks JSON report, each file made relative to `scanRoot`
 * again. An error for a report not in the shape gitleaks writes, rather than a
 * pass.
 */
export const parseReport = (
  report: unknown,
  scanRoot: string,
): Result<readonly Finding[], string> => {
  if (!Arr.isArray(report)) {
    return Result.err('❌ The gitleaks report is not a list of findings.');
  }

  const findings = report.map((entry: unknown): Finding | undefined =>
    isRecord(entry) &&
    typeof entry['RuleID'] === 'string' &&
    typeof entry['File'] === 'string' &&
    typeof entry['StartLine'] === 'number'
      ? {
          rule: entry['RuleID'],
          file: path.relative(scanRoot, entry['File']),
          line: entry['StartLine'],
        }
      : undefined,
  );

  return findings.every((finding) => finding !== undefined)
    ? Result.ok(findings)
    : Result.err(
        '❌ A finding of the gitleaks report has no rule, file or line.',
      );
};

/** The failure message for `findings`. */
export const describeFindings = (
  findings: readonly Finding[],
  version: string,
): string =>
  [
    `❌ gitleaks ${version} reads these as secrets:`,
    '',
    ...findings.map(({ file, line, rule }) => `  ${file}:${line} ${rule}`),
    '',
    'A real secret is taken out of the file and revoked where it was issued:',
    'once pushed, it is public. A value that only looks like one is marked on',
    'its line with a `gitleaks:allow` comment and the reason beside it; a kind',
    'of file whose values are public by design gets an allowlist in',
    'tools/configs/gitleaks.toml.',
  ].join('\n');

/** The pinned gitleaks, installed, and its version. */
export const installPinnedGitleaks = async (): Promise<
  Result<Readonly<{ binary: string; version: string }>, string>
> => {
  const pins = await readReleaseBinaryPins();

  if (Result.isErr(pins)) {
    return pins;
  }

  const pin = pins.value['gitleaks'];

  if (pin === undefined) {
    return Result.err(
      '❌ tools/configs/release-binaries.json pins no gitleaks.',
    );
  }

  return Result.map(
    await installReleaseBinary({
      name: 'gitleaks',
      pin,
      platform: platformKey(process.platform, process.arch),
      cacheDir: releaseBinaryCacheDir,
      download: downloadWithFetch,
    }),
    (binary) => ({ binary, version: pin.version }),
  );
};

/**
 * The findings of gitleaks over `files` (relative to `root`), copied under
 * `scanRoot` first, a directory of the caller's own that is left for it to
 * remove.
 */
export const scanFiles = async ({
  gitleaks,
  root,
  files,
  scanRoot,
}: Readonly<{
  gitleaks: string;
  root: string;
  files: readonly string[];
  scanRoot: string;
}>): Promise<Result<readonly Finding[], string>> => {
  const sourceRoot = path.join(scanRoot, 'files');

  const copied = await Result.fromPromise(
    Promise.all(
      files.map(async (file) => {
        const target = path.join(sourceRoot, file);

        // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path git listed, under a directory of this run's own.
        await fs.mkdir(path.dirname(target), { recursive: true });

        await fs.copyFile(path.join(root, file), target);
      }),
    ),
  );

  if (Result.isErr(copied)) {
    return Result.err(
      `❌ Could not copy the files to scan: ${unknownToString(copied.value)}`,
    );
  }

  const reportPath = path.join(scanRoot, 'report.json');

  const run = await runFile(gitleaks, [
    'dir',
    sourceRoot,
    '--config',
    configPath,
    '--redact',
    '--no-banner',
    '--log-level',
    'error',
    '--report-format',
    'json',
    '--report-path',
    reportPath,
    '--exit-code',
    '0',
  ]);

  // `--exit-code 0`: findings are read from the report, so any other end is
  // gitleaks failing.
  if (run.error !== undefined || run.status !== 0) {
    return Result.err(`❌ gitleaks failed: ${describeFailure(run)}`);
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a file of this run's own.
  const text = await Result.fromPromise(fs.readFile(reportPath, 'utf8'));

  if (Result.isErr(text)) {
    return Result.err(
      `❌ gitleaks wrote no report: ${unknownToString(text.value)}`,
    );
  }

  const report = Json.parse(text.value);

  return Result.isErr(report)
    ? Result.err('❌ The gitleaks report is not JSON.')
    : parseReport(report.value, sourceRoot);
};

export type Finding = Readonly<{
  rule: string;
  /** From the repository root. */
  file: string;
  line: number;
}>;

const configPath = path.resolve(projectRootPath, 'tools/configs/gitleaks.toml');

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkRepository().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(result.value);
}
