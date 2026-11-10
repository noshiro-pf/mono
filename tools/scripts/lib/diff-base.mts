import { projectRootPath } from '../project-root-path.mjs';
import { runFile } from './child-process.mjs';

/**
 * The commit the `check:prose` guards that read a change compare the tree with:
 * `PROSE_DIFF_BASE`, which `style-check.yml` sets to the base of the pull
 * request (the commit before the push on `main`, `origin/main` for a queue
 * layer on a `queue/*` branch, the tree itself on any other manual run, whose
 * verdict the gate does not let be reused) and fetches, or else the merge base
 * of `HEAD` and `origin/main`.
 * `variable` names another environment variable for a caller that is not one of
 * those guards.
 *
 * A base that is not in the clone is an error rather than an empty change,
 * which would pass every check that reads one. `purpose` finishes the sentence
 * "the commit to …" in the messages.
 */
export const resolveDiffBase = async (
  purpose: string,
  variable: string = DIFF_BASE_VARIABLE,
): Promise<string> => {
  const fromEnv = process.env[variable];

  if (fromEnv !== undefined && fromEnv !== '') {
    const verified = await runFile(
      'git',
      // `^0` peels to the commit, and fails on anything that is not one.
      ['rev-parse', '--verify', '--quiet', `${fromEnv}^0`],
      { cwd: projectRootPath },
    );

    if (verified.status !== 0) {
      throw new Error(
        `${variable} is ${fromEnv}, which is not a commit in this clone. Fetch it first.`,
      );
    }

    return fromEnv;
  }

  const mergeBase = await runFile(
    'git',
    ['merge-base', 'HEAD', 'origin/main'],
    {
      cwd: projectRootPath,
    },
  );

  if (mergeBase.status !== 0) {
    throw new Error(
      [
        `Could not find the commit to ${purpose}: ${variable} is`,
        `not set, and \`git merge-base HEAD origin/main\` failed: ${mergeBase.stderr.trim()}`,
        `Fetch origin/main, or set ${variable} to the base of the change.`,
      ].join('\n'),
    );
  }

  return mergeBase.stdout.trim();
};

const DIFF_BASE_VARIABLE = 'PROSE_DIFF_BASE';
