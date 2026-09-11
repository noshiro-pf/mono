import { Arr, Result } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import config from '../../../.markdownlint-cli2.mjs';

/**
 * Fails when `.markdownlint-cli2.mjs` excludes anything through a `globs`
 * negation. Exclusions belong in `ignores`, and the difference is not
 * stylistic.
 *
 * A `globs` negation is matched against the path as written. One anchored at
 * the cwd — `!articles/**\/*` — cannot match a file named on the command line
 * as an absolute path, so that file is linted, and since this configuration
 * sets `fix: true`, linted means rewritten. That is how `articles/` and
 * `experimental/` kept acquiring `*` → `-` list-marker changes, with their
 * spacing preserved: the fingerprint of this configuration's own rules, since
 * `list-marker-space` is off here. No repository script could reproduce it,
 * because every one of them passes relative globs; one absolute path
 * reproduces it exactly, and an editor plugin linting the open document is
 * enough to do it.
 *
 * `ignores` has no such gap. markdownlint-cli2 appends those entries to the
 * glob patterns itself — "Pass base ignore globs as globby patterns (best
 * performance)", in its own words — so the discovery walk is pruned exactly as
 * a negation would prune it, and then applies them again after discovery, to
 * whatever was collected however it was named. They also survive `--no-globs`,
 * which drops `globs` and keeps `ignores`. Measured: the two spellings lint
 * the same file count in the same time, and only `ignores` holds for an
 * absolute path.
 *
 * So a negation in `globs` is either redundant with an `ignores` entry or a
 * hole, and there is no way to tell which at a glance. This check is what
 * says so when the next exclusion is added to the wrong list.
 */
export const checkMarkdownlintConfig = (): Result<number, string> => {
  // Read straight off the config: both fields are literals there, so removing
  // one is a type error here rather than a silently skipped check.
  const globs: readonly string[] = config.globs;

  const ignores: readonly string[] = config.ignores;

  const negations = globs.filter((glob) => glob.startsWith('!'));

  if (Arr.isNonEmpty(negations)) {
    return Result.err(
      [
        '❌ .markdownlint-cli2.mjs: `globs` excludes something by negation.',
        '',
        ...negations.flatMap((negation) => [
          `  "${negation}" is a \`globs\` negation.`,
          `    → move it to \`ignores\` as "${negation.slice(1)}".`,
        ]),
        '',
        'A `globs` negation is matched against the path as written, so one',
        'anchored at the cwd does not match an absolute path — the file is',
        'linted, and `fix: true` means rewritten. `ignores` prunes the walk',
        'just the same and also holds for a path named directly.',
      ].join('\n'),
    );
  }

  return Result.ok(ignores.length);
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = checkMarkdownlintConfig();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `.markdownlint-cli2.mjs: \`globs\` excludes nothing by negation; ${result.value} exclusion(s) are in \`ignores\`.`,
  );
}
