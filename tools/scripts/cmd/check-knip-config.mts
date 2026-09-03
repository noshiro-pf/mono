import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, isRecord, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import * as ts from 'typescript';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when `knip.jsonc` does not parse, or when a workspace entry contains
 * another workspace path as a key.
 *
 * Both halves come from the same accident, which happened three times in a
 * row (#1758 / #1754 / #1756). Adding an app means inserting a block after
 * the previous entry's closing brace, and most of those blocks are
 * byte-identical — five share `{"entry": ["src/index.mts"], "project":
 * ["**\/*.mts"]}` alone — so an edit anchored on `"entry": [...]` lands
 * *inside* the preceding entry instead of after it. The victim loses its
 * body and the new key becomes one of its properties.
 *
 * Nothing else catches it. Git auto-merges the insertion without a conflict,
 * and knip is not run by the fast checks, so the first sign is
 * `style-check (fmt:full)` reporting a Prettier `SyntaxError` — a message
 * about formatting, several minutes into CI, that names neither knip nor the
 * entry that was damaged.
 *
 * The nesting half matters because the brace arithmetic does not always come
 * out unbalanced: shift the insertion point and the same mistake yields a
 * file that parses cleanly while silently disabling the entry it swallowed.
 */
export const checkKnipConfig = async (): Promise<Result<number, string>> => {
  const configPath = path.resolve(projectRootPath, 'knip.jsonc');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const text = await Result.fromPromise(fs.readFile(configPath, 'utf8'));

  if (Result.isErr(text)) {
    return Result.err(
      `❌ could not read knip.jsonc: ${unknownToString(text.value)}`,
    );
  }

  const parsed = ts.parseConfigFileTextToJson('knip.jsonc', text.value);

  if (parsed.error !== undefined) {
    return Result.err(
      [
        '❌ knip.jsonc does not parse:',
        '',
        `  ${ts.flattenDiagnosticMessageText(parsed.error.messageText, '\n  ')}`,
        '',
        'A new workspace entry goes *after* the previous entry’s closing',
        '`},`, never after its `"entry"` line — the blocks are near-identical,',
        'so an anchored insertion easily lands inside the one above.',
      ].join('\n'),
    );
  }

  const config: unknown = parsed.config;

  if (!isRecord(config)) {
    return Result.err('❌ knip.jsonc is not an object.');
  }

  const workspaces: unknown = config['workspaces'];

  if (workspaces === undefined) {
    return Result.ok(0);
  }

  if (!isRecord(workspaces)) {
    return Result.err('❌ knip.jsonc `workspaces` is not an object.');
  }

  const violations = Object.entries(workspaces).flatMap(([name, entry]) =>
    collectNestedWorkspaceKeys(name, entry),
  );

  if (Arr.isNonEmpty(violations)) {
    return Result.err(
      [
        `❌ ${violations.length} knip.jsonc workspace entry problem(s):`,
        '',
        ...violations.flatMap((violation) => [
          `  "${violation.owner}"`,
          `    holds "${violation.key}", which is a workspace path, not a knip option.`,
          `    → "${violation.key}" was inserted inside "${violation.owner}" instead of after it.`,
          '',
        ]),
        'Move the entry out so that both stand as siblings of one another.',
      ].join('\n'),
    );
  }

  return Result.ok(Object.keys(workspaces).length);
};

type Violation = Readonly<{ owner: string; key: string }>;

/** A workspace path used as a key inside another entry — never legitimate. */
const collectNestedWorkspaceKeys = (
  owner: string,
  entry: unknown,
): readonly Violation[] =>
  isRecord(entry)
    ? Object.keys(entry)
        .filter(looksLikeWorkspacePath)
        .map((key) => ({ owner, key }))
    : [];

/**
 * knip's own workspace options are bare identifiers (`entry`, `project`,
 * `ignore`, …) or plugin names; only a workspace key carries a `/`. Matching
 * on the workspace globs in `pnpm-workspace.yaml` keeps the rule narrow
 * enough that a future knip option containing a slash would not trip it.
 */
const looksLikeWorkspacePath = (key: string): boolean =>
  ['apps/', 'libs/', 'tools/', 'languages/', 'strict-lib/'].some((prefix) =>
    key.startsWith(prefix),
  );

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkKnipConfig().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `knip.jsonc parses; ${result.value} workspace entry/entries are well-formed.`,
  );
}
