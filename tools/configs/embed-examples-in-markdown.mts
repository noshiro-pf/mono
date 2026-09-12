import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { unknownToString } from 'ts-data-forge';
import { formatFiles, Result } from 'ts-repo-utils';
import { extractSampleCode } from './embed-examples-utils.mjs';

/**
 * One markdown document and the samples that fill its code fences.
 *
 * `sampleCodeFiles` are resolved against `samplesDir` and consumed in order:
 * the n-th name fills the n-th fence in the document, and the two counts must
 * agree.
 */
export type MarkdownDocument = Readonly<{
  mdPath: string;
  samplesDir: string;
  sampleCodeFiles: readonly string[];
}>;

export type EmbedExamplesInMarkdownOptions = Readonly<{
  documents: readonly MarkdownDocument[];

  /**
   * See `ExtractSampleCodeOptions` in `embed-examples-utils.mts`, which is
   * where the reason this is not always on is written down.
   */
  stripTransformerDirectives?: boolean;
}>;

/**
 * Embeds sample code into the JavaScript / TypeScript fences of markdown
 * documents — a package's README, usually, from its `samples/readme`.
 *
 * Every such fence has to be backed by a sample; see
 * {@link fenceStartRegex} for what counts as one. A package's
 * `scripts/cmd/embed-examples.mts` is the mapping and nothing else; this is
 * the code that was copied into all thirteen of them.
 */
export const embedExamplesInMarkdown = async ({
  documents,
  stripTransformerDirectives,
}: EmbedExamplesInMarkdownOptions): Promise<Result<undefined, unknown>> => {
  try {
    for (const { mdPath, sampleCodeFiles, samplesDir } of documents) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const markdownContent = await fs.readFile(mdPath, 'utf8');

      const samples = await Promise.all(
        sampleCodeFiles.map(async (sampleCodeFile) => {
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          const sampleContent = await fs.readFile(
            path.resolve(samplesDir, sampleCodeFile),
            'utf8',
          );

          return {
            name: sampleCodeFile,
            code: extractSampleCode(sampleContent, {
              stripTransformerDirectives,
            }),
          } as const;
        }),
      );

      const embedded = embedSamplesIntoMarkdown(markdownContent, samples);

      if (Result.isErr(embedded)) {
        return Result.err(`❌ ${mdPath}: ${embedded.value}`);
      }

      for (const { name } of samples) {
        console.info(`✓ Updated code block for ${name}`);
      }

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(mdPath, embedded.value, 'utf8');

      await formatFiles([mdPath]);
    }

    return Result.ok(undefined);
  } catch (error) {
    return Result.err(`❌ Failed to embed samples: ${unknownToString(error)}`);
  }
};

/**
 * Replaces the body of every sample-backed fence in `markdown`, in order, with
 * the corresponding sample.
 *
 * A fence nested in a list item keeps its indentation: the sample is indented
 * to the column of the opening fence, which is what markdown needs to keep the
 * block inside the item.
 */
export const embedSamplesIntoMarkdown = (
  markdown: string,
  samples: readonly Readonly<{ name: string; code: string }>[],
): Result<string, string> => {
  const fenceCount = countSampleBackedFences(markdown);

  if (fenceCount !== samples.length) {
    return Result.err(
      `Code block count mismatch: found ${fenceCount} JavaScript / TypeScript code blocks but expected ${samples.length} sample files`,
    );
  }

  const mut_results: string[] = [];

  let mut_rest: string = markdown;

  for (const { name, code } of samples) {
    const match = fenceStartRegex.exec(mut_rest);

    if (match === null) {
      return Result.err(`Opening code fence not found for ${name}`);
    }

    const indent = match[1] ?? '';

    const bodyStartIndex = match.index + match[0].length;

    const closing = fenceEndRegex.exec(mut_rest.slice(bodyStartIndex));

    if (closing === null) {
      return Result.err(`Closing code fence not found for ${name}`);
    }

    // `fenceEndRegex` matches from the line break before the closing fence, so
    // the rest keeps the fence's own indentation.
    const closingLineStartIndex = bodyStartIndex + closing.index + 1;

    mut_results.push(
      mut_rest.slice(0, bodyStartIndex),
      indentLines(code, indent),
    );

    mut_rest = mut_rest.slice(closingLineStartIndex);
  }

  mut_results.push(mut_rest);

  return Result.ok(mut_results.join('\n'));
};

/**
 * Number of fences in `markdown` that must be backed by a sample, at any
 * indentation.
 */
export const countSampleBackedFences = (markdown: string): number =>
  Array.from(markdown.matchAll(fenceStartRegexGlobal)).length;

/**
 * Matches the opening fence of a sample-backed block, capturing its
 * indentation.
 *
 * Every spelling of JavaScript and TypeScript is listed, not just the `ts` /
 * `tsx` / `js` the embedder once matched, and a fence nested in a list item
 * counts too: a fence tagged `typescript` used to be skipped, so it was
 * hand-written, never type-checked, and free to call functions that do not
 * exist — which is exactly what one in `ts-type-forge`'s README did.
 *
 * The `(?=\s|$)` lookahead requires the tag to be followed by whitespace or
 * end-of-line, so a tag such as `ts-ignore` does not match. Only the fence
 * prefix (indentation, backticks and tag) is matched; any trailing info string
 * is not part of the match.
 */
const fenceStartRegex =
  /^([ \t]*)```(?:ts|tsx|mts|cts|typescript|js|jsx|mjs|cjs|javascript)(?=\s|$)/mu;

/**
 * Global counterpart of {@link fenceStartRegex} for counting all fences. The
 * flags are derived from `fenceStartRegex` (plus `g`) so the two cannot drift.
 */
const fenceStartRegexGlobal = new RegExp(
  fenceStartRegex,
  `${fenceStartRegex.flags.replace('g', '')}g`,
);

/** The line break before a closing fence, at any indentation. */
const fenceEndRegex = /\n[ \t]*```/u;

const indentLines = (code: string, indent: string): string =>
  indent === ''
    ? code
    : code
        .split('\n')
        .map((line) => (line.trim() === '' ? '' : `${indent}${line}`))
        .join('\n');
