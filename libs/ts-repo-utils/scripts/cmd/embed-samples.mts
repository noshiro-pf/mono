import { formatFiles } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

const codeBlockStart = '```typescript';
const codeBlockEnd = '```';

const ignoreKeyword = '// embed-sample-code-ignore';

const sampleCodePaths = [
  '001-command-execution.mts',
  '002-command-execution-type.mts',
  '003-is-directly-executed.mts',
  '004-path-exists.mts',
  '005-assert-path-exists.mts',
  '006-assert-ext.mts',
  '007-assert-ext-type.mts',
  '008-repo-is-dirty.mts',
  '009-assert-repo-is-clean.mts',
  '010-get-diff-from-type.mts',
  '011-check-should-run-type-checks.mts',
  '012-format-files-glob.mts',
  '013-format-uncommitted-files.mts',
  '014-format-uncommitted-files-type.mts',
  '015-format-diff-from.mts',
  '016-format-diff-from-type.mts',
  '017-gen-index.mts',
  '018-gen-index-type.mts',
  '019-run-cmd-in-stages-across-workspaces.mts',
  '020-run-cmd-in-parallel-across-workspaces.mts',
  '021-get-workspace-packages.mts',
  '022-get-workspace-packages-type.mts',
  '023-execute-parallel.mts',
  '024-execute-stages.mts',
  '025-globals.mts',
  '026-pre-commit-hook.mts',
  '027-build-pipeline.mts',
  '028-project-validation.mts',
] as const;

const readmePath = path.resolve(projectRootPath, 'README.md');
const samplesDir = path.resolve(projectRootPath, 'samples/readme');

/** Embeds sample code from ./samples directory into README.md */
export const embedSamples = async (): Promise<Result<undefined, unknown>> => {
  try {
    const readmeContent = await fs.readFile(readmePath, 'utf8');

    const mut_results: string[] = [];
    let mut_rest: string = readmeContent;

    for (const sampleCodePath of sampleCodePaths) {
      const samplePath = path.resolve(samplesDir, sampleCodePath);
      const sampleContent = await fs.readFile(samplePath, 'utf8');
      const sampleContentSliced = sampleContent.slice(
        0,
        sampleContent.indexOf(ignoreKeyword),
      );

      const codeBlockStartIndex = mut_rest.indexOf(codeBlockStart);

      if (codeBlockStartIndex === -1) {
        return Result.err(`❌ codeBlockStart not found for ${sampleCodePath}`);
      }

      const codeBlockEndIndex = mut_rest.indexOf(
        codeBlockEnd,
        codeBlockStartIndex + codeBlockStart.length,
      );

      if (codeBlockEndIndex === -1) {
        return Result.err(`❌ codeBlockEnd not found for ${sampleCodePath}`);
      }

      // Replace the code block content
      const beforeBlock = mut_rest.slice(
        0,
        Math.max(0, codeBlockStartIndex + codeBlockStart.length),
      );
      const afterBlock = mut_rest.slice(Math.max(0, codeBlockEndIndex));

      mut_results.push(beforeBlock, sampleContentSliced);

      mut_rest = afterBlock;

      console.log(`✓ Updated code block for ${sampleCodePath}`);
    }

    mut_results.push(mut_rest);

    // Write updated README
    await fs.writeFile(readmePath, mut_results.join('\n'), 'utf8');

    await formatFiles([readmePath]);

    return Result.ok(undefined);
  } catch (error) {
    return Result.err(`❌ Failed to embed samples: ${String(error)}`);
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  await embedSamples();
}
