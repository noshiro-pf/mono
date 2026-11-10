/**
 * The workspace member globs, read from `pnpm-workspace.yaml` — the one list
 * written by hand. The root `package.json` `workspaces` has to repeat it for
 * `ts-repo-utils` and `assert-deps-built`, and `check:root:workspace-globs`
 * holds the two equal; a guard that needs them reads them here rather than
 * keeping a copy.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import type { FixedLengthTuple } from 'ts-type-forge';
import { projectRootPath } from '../project-root-path.mjs';

/** The `packages` globs of `pnpm-workspace.yaml`, in the order written. */
export const readPnpmWorkspaceGlobs = async (): Promise<
  Result<readonly string[], string>
> => {
  const content = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(path.join(projectRootPath, PNPM_WORKSPACE_FILE_NAME), 'utf8'),
  );

  if (Result.isErr(content)) {
    return Result.err(
      `Failed to read ${PNPM_WORKSPACE_FILE_NAME}: ${unknownToString(content.value)}`,
    );
  }

  return parseWorkspacePackages(content.value);
};

/**
 * The manifest of each member a `packages` glob matches. The root's is not one
 * of them: a guard that reads it too adds `package.json` itself.
 */
export const memberManifestGlobs = (
  globs: readonly string[],
): readonly string[] => globs.map((g) => path.posix.join(g, 'package.json'));

/**
 * The entries of the top-level `packages` block sequence.
 *
 * This reads the one shape the file uses — `packages:` alone on its line, then
 * `- <glob>` items (plain, `'single'` or `"double"` quoted, without escapes),
 * with comments and blank lines between them — and refuses any other rather
 * than returning a partial list.
 */
export const parseWorkspacePackages = (
  content: string,
): Result<readonly string[], string> => {
  const lines = content.split(/\r?\n/u);

  const keyIndex = lines.findIndex((line) => line.startsWith('packages:'));

  if (keyIndex === -1) {
    return Result.err(
      `${PNPM_WORKSPACE_FILE_NAME} has no top-level \`packages\` key.`,
    );
  }

  if (!isBlankOrComment((lines[keyIndex] ?? '').slice('packages:'.length))) {
    return Result.err(
      `${PNPM_WORKSPACE_FILE_NAME}: \`packages\` must be a block sequence (\`packages:\` alone on its line, then \`- <glob>\` items).`,
    );
  }

  const mut_globs: string[] = [];

  let mut_itemIndent: number | undefined = undefined;

  for (const line of lines.slice(keyIndex + 1)) {
    if (isBlankOrComment(line)) {
      continue;
    }

    // The next top-level key ends the list. An item may sit at column 0.
    if (!/^\s/u.test(line) && !line.startsWith('- ')) {
      break;
    }

    const indent = line.length - line.trimStart().length;

    // YAML forbids tabs in indentation.
    if (line.slice(0, indent).includes('\t')) {
      return Result.err(
        `${PNPM_WORKSPACE_FILE_NAME}: \`packages\` is indented with a tab.`,
      );
    }

    mut_itemIndent ??= indent;

    // A line indented otherwise continues or nests in an item, which YAML reads
    // differently from a glob of its own.
    const glob =
      indent === mut_itemIndent ? parseSequenceItem(line.trim()) : undefined;

    if (glob === undefined) {
      return Result.err(
        `${PNPM_WORKSPACE_FILE_NAME}: cannot read \`${line.trim()}\` in \`packages\` as a \`- <glob>\` item.`,
      );
    }

    mut_globs.push(glob);
  }

  if (!Arr.isNonEmpty(mut_globs)) {
    return Result.err(
      `${PNPM_WORKSPACE_FILE_NAME}: \`packages\` lists no globs.`,
    );
  }

  return Result.ok(mut_globs);
};

export const PNPM_WORKSPACE_FILE_NAME = 'pnpm-workspace.yaml';

const isBlankOrComment = (text: string): boolean => {
  const trimmed = text.trim();

  return trimmed === '' || trimmed.startsWith('#');
};

const splitPlain = (value: string): FixedLengthTuple<2, string> => {
  const commentIndex = value.search(/\s#/u);

  return commentIndex === -1
    ? [value, '']
    : [value.slice(0, commentIndex).trimEnd(), value.slice(commentIndex)];
};

const isQuoted = (value: string): boolean =>
  value.startsWith("'") || value.startsWith('"');

/**
 * A plain value YAML reads as something other than the string: one starting
 * with an indicator (a comment, an alias, an anchor, a tag — `!` included, so a
 * negated glob has to be quoted —, a block or flow collection), or one holding
 * `: ` or ending in `:`, which makes it a mapping.
 */
const isNotPlainGlob = (glob: string): boolean =>
  /^[#*&!|>{[\]}@%`,?:-]/u.test(glob) || /:(?:\s|$)/u.test(glob);

/** The value and what follows it on the line, or `['', '']` if unterminated. */
const splitValue = (value: string): FixedLengthTuple<2, string> => {
  const quote = value.at(0);

  if (quote !== undefined && isQuoted(value)) {
    const end = value.indexOf(quote, 1);

    return end === -1 ? ['', ''] : [value.slice(1, end), value.slice(end + 1)];
  }

  return splitPlain(value);
};

/**
 * The glob of a trimmed `- <glob>` line, optionally quoted and followed by a
 * `#` comment, or `undefined` when it is not one. A plain value ends at the
 * first ` #`, as in YAML; a quoted one keeps a `#` inside. A value with a quote
 * or backslash left in it would need YAML's escapes, and a plain one YAML reads
 * as something else is not a glob; both are refused.
 */
const parseSequenceItem = (trimmed: string): string | undefined => {
  if (!trimmed.startsWith('- ')) {
    return undefined;
  }

  const value = trimmed.slice(2).trim();

  const [glob, rest] = splitValue(value);

  return glob === '' ||
    /['"\\]/u.test(glob) ||
    !(rest.trim() === '' || /^\s+#/u.test(rest)) ||
    (!isQuoted(value) && isNotPlainGlob(glob))
    ? undefined
    : glob;
};
