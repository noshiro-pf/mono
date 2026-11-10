/**
 * A note per package whose Firestore rules tests the diff touches, since
 * `check-changed` does not run them: `check:test:rules` needs Java and the
 * Firestore emulator. Without one a run under `skip-ci` reads as green while
 * the rules tests have not run, and their failure first shows when `skip-ci`
 * comes off.
 *
 * Keyed on the package having a `check:test:rules` script, not on the apps that
 * have one today. What the tests read: the package's `firestore.rules`, its
 * `test/` (the rules config's `include`), and that config.
 */
export const findRulesTestNotes = (
  changedFiles: readonly string[],
  packages: readonly Readonly<{
    name: string;
    dir: string;
    scripts: ReadonlySet<string>;
  }>[],
): readonly string[] =>
  packages
    .filter(
      ({ dir, scripts }) =>
        scripts.has(RULES_SCRIPT) &&
        changedFiles.some((file) =>
          RULES_TEST_INPUTS.some((input) =>
            input.endsWith('/')
              ? file.startsWith(`${dir}/${input}`)
              : file === `${dir}/${input}`,
          ),
        ),
    )
    .map(
      ({ name }) =>
        `${name}: the Firestore rules or their tests changed, and \`${RULES_SCRIPT}\` was not run (it needs Java and the Firestore emulator). Run \`pnpm --filter ${name} run ${RULES_SCRIPT}\` before calling this green.`,
    );

const RULES_SCRIPT = 'check:test:rules';

/** Package-relative; one ending in `/` is a directory. */
const RULES_TEST_INPUTS = [
  'firestore.rules',
  'test/',
  'configs/vitest.rules.config.mts',
] as const;
