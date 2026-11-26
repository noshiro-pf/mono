import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import * as ts from 'typescript';
import { listTrackedFiles, readRepositoryFile } from '../lib/repo-files.mjs';

/**
 * Fails on a key written twice in one object of a JSON file read with comments:
 * every `*.jsonc`, every `tsconfig*.json`, and the root `.vscode/*.json`,
 * outside `experimental/`.
 *
 * Their readers keep the later key and say nothing, so the first one's settings
 * are silently dead (a duplicate `knip.jsonc` entry was, until a review found
 * it). The guards that read these files see the parsed object, where the
 * duplicate is already gone. The text is parsed with `ts.parseJsonText`, the
 * parser `tsc` uses for these files: it accepts comments and trailing commas,
 * and keeps both properties in the tree.
 */
export const checkJsoncDuplicateKeys = async (): Promise<
  Result<number, string>
> => {
  const tracked = await listTrackedFiles();

  if (Result.isErr(tracked)) {
    return Result.err(`❌ ${tracked.value}`);
  }

  const files = tracked.value.filter(isJsoncInScope);

  const mut_problems: string[] = [];

  for (const file of files) {
    const text = await readRepositoryFile(file);

    if (Result.isErr(text)) {
      return Result.err(`❌ ${text.value}`);
    }

    for (const { key, firstLine, line } of findDuplicateKeys(
      file,
      text.value,
    )) {
      mut_problems.push(
        `${file}: "${key}" is written twice, on lines ${firstLine.toString()} and ${line.toString()}; the later one wins`,
      );
    }
  }

  return Arr.isNonEmpty(mut_problems)
    ? Result.err(
        [
          `❌ ${mut_problems.length.toString()} key(s) written twice in one object:`,
          '',
          ...mut_problems.map((problem) => `  ${problem}`),
          '',
          'Keep the one that is meant and delete the other.',
        ].join('\n'),
      )
    : Result.ok(files.length);
};

/** Every key written twice in one object of a JSON or JSONC text. */
export const findDuplicateKeys = (
  fileName: string,
  text: string,
): readonly DuplicateKey[] => {
  const source = ts.parseJsonText(fileName, text);

  const lineOf = (node: ts.Node): number =>
    source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;

  const mut_found: DuplicateKey[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isObjectLiteralExpression(node)) {
      const mut_seen = new Map<string, number>();

      for (const property of node.properties) {
        if (property.name === undefined || !ts.isStringLiteral(property.name)) {
          continue;
        }

        const key = property.name.text;

        const firstLine = mut_seen.get(key);

        if (firstLine === undefined) {
          mut_seen.set(key, lineOf(property.name));
        } else {
          mut_found.push({ key, firstLine, line: lineOf(property.name) });
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(source);

  return mut_found;
};

/**
 * Whether the tracked file `relativePath` is read as JSON with comments, and so
 * is checked: a `*.jsonc`, a `tsconfig*.json`, or a `.vscode/*.json` at the
 * root, outside `experimental/`.
 */
export const isJsoncInScope = (relativePath: string): boolean =>
  !relativePath.startsWith('experimental/') &&
  (relativePath.endsWith('.jsonc') ||
    /(?:^|\/)tsconfig[^/]*\.json$/u.test(relativePath) ||
    /^\.vscode\/[^/]+\.json$/u.test(relativePath));

type DuplicateKey = Readonly<{
  key: string;
  /** The line of the first occurrence, 1-based. */
  firstLine: number;
  /** The line of the later one, 1-based. */
  line: number;
}>;

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkJsoncDuplicateKeys().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value.toString()} JSON file(s) with comments read; no key is written twice in one object.`,
  );
}
