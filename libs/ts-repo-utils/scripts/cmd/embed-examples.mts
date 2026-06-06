import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Result, unknownToString } from 'ts-data-forge';
import { formatFiles, isDirectlyExecuted } from 'ts-repo-utils';
import { type DeepReadonly } from 'ts-type-forge';
import { projectRootPath } from '../project-root-path.mjs';
import { extractSampleCode } from './embed-examples-utils.mjs';

const codeBlockEnd = '```';

/**
 * Matches the start of an opening code fence whose language tag is exactly
 * `ts`, `tsx`, or `js`. The `(?=\s|$)` lookahead requires the tag to be followed
 * by whitespace or end-of-line, so tags like `jsx`, `typescript`, or
 * `ts-ignore` are not matched. Only the fence prefix (backticks + tag) is
 * matched; any trailing info string is not part of the match.
 */
const codeBlockStartRegex = /^```(?:tsx|ts|js)(?=\s|$)/mu;

/**
 * Global counterpart of {@link codeBlockStartRegex} for counting all fences. The
 * flags are derived from `codeBlockStartRegex` (plus `g`) so the two cannot drift.
 */
const codeBlockStartRegexGlobal = new RegExp(
  codeBlockStartRegex,
  `${codeBlockStartRegex.flags.replace('g', '')}g`,
);

/**
 * Each entry maps to a code block (```tsx / ```ts / ```js) in the target
 * markdown, in document order. The list length must equal the number of such
 * blocks in the markdown.
 */
const documents: DeepReadonly<
  {
    mdPath: string;
    samplesDir: string;
    sampleCodeFiles: string[];
  }[]
> = [
  {
    mdPath: path.resolve(projectRootPath, 'README.md'),
    samplesDir: path.resolve(projectRootPath, 'samples/readme'),
    sampleCodeFiles: [
      '001-command-execution.mts',
      '002-command-execution-type.mts',
      '003-is-directly-executed.mts',
      '004-path-exists.mts',
      '005-assert-path-exists.mts',
      '006-check-ext.mts',
      '007-assert-ext.mts',
      '008-assert-ext-type.mts',
      '009-create-result-assert.mts',
      '010-make-empty-dir.mts',
      '011-repo-is-dirty.mts',
      '012-assert-repo-is-clean.mts',
      '013-get-diff-from-type.mts',
      '014-check-should-run-type-checks.mts',
      '015-format-files-glob.mts',
      '016-format-uncommitted-files.mts',
      '017-format-uncommitted-files-type.mts',
      '018-format-diff-from.mts',
      '019-format-diff-from-type.mts',
      '020-gen-index.mts',
      '021-gen-index-type.mts',
      '022-run-cmd-in-stages-across-workspaces.mts',
      '023-run-cmd-in-parallel-across-workspaces.mts',
      '024-get-workspace-packages.mts',
      '025-get-workspace-packages-type.mts',
      '026-execute-parallel.mts',
      '027-execute-stages.mts',
      '028-pre-commit-hook.mts',
      '029-build-pipeline.mts',
      '030-project-validation.mts',
    ],
  },
] as const;

/** Embeds sample code from ./samples/readme directory into README.md */
export const embedExamples = async (): Promise<Result<undefined, unknown>> => {
  try {
    for (const { mdPath, sampleCodeFiles, samplesDir } of documents) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const markdownContent = await fs.readFile(mdPath, 'utf8');

      const codeBlockCount = (
        markdownContent.match(codeBlockStartRegexGlobal) ?? []
      ).length;

      if (codeBlockCount !== sampleCodeFiles.length) {
        return Result.err(
          `❌ Code block count mismatch in ${mdPath}: found ${codeBlockCount} code blocks but expected ${sampleCodeFiles.length} sample files`,
        );
      }

      const mut_results: string[] = [];

      let mut_rest: string = markdownContent;

      for (const sampleCodeFile of sampleCodeFiles) {
        const samplePath = path.resolve(samplesDir, sampleCodeFile);

        // Read sample content
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const sampleContent = await fs.readFile(samplePath, 'utf8');

        const sampleContentSliced = extractSampleCode(sampleContent);

        // Find the next code block (line-start anchor avoids nested fences)
        const match = codeBlockStartRegex.exec(mut_rest);

        if (match === null) {
          return Result.err(
            `❌ Opening code fence (\`\`\`ts, \`\`\`tsx, or \`\`\`js) not found for ${sampleCodeFile}`,
          );
        }

        const codeBlockStartIndex = match.index;

        const codeBlockStart = match[0];

        const codeBlockEndIndex = mut_rest.indexOf(
          codeBlockEnd,
          codeBlockStartIndex + codeBlockStart.length,
        );

        if (codeBlockEndIndex === -1) {
          return Result.err(`❌ codeBlockEnd not found for ${sampleCodeFile}`);
        }

        // Replace the code block content
        const beforeBlock = mut_rest.slice(
          0,
          Math.max(0, codeBlockStartIndex + codeBlockStart.length),
        );

        const afterBlock = mut_rest.slice(Math.max(0, codeBlockEndIndex));

        mut_results.push(beforeBlock, sampleContentSliced);

        mut_rest = afterBlock;

        console.log(`✓ Updated code block for ${sampleCodeFile}`);
      }

      mut_results.push(mut_rest);

      // Write updated README
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(mdPath, mut_results.join('\n'), 'utf8');

      await formatFiles([mdPath]);
    }

    return Result.ok(undefined);
  } catch (error) {
    return Result.err(`❌ Failed to embed samples: ${unknownToString(error)}`);
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await embedExamples();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }
}
