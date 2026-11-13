import type * as util from 'node:util';

/**
 * The `--owner` / `--repo` options, declared once for the two parses of the
 * same command line: the strict one in `cmd/cli-spec.mts`, which refuses a
 * command line before anything is sent, and the loose one in
 * `github/resolve-target-repo.mts`, which reads their values.
 *
 * A module of its own because `src/github`'s barrel resolves the target
 * repository when imported, which the argument check must come before.
 */
export const TARGET_REPO_OPTIONS = {
  owner: { type: 'string' },
  repo: { type: 'string' },
} as const satisfies util.ParseArgsConfig['options'];
