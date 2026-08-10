/**
 * Generates .diff files showing the differences between English and Japanese
 * sample code files. Each diff is written alongside the Japanese file in the
 * ja/ subdirectory with a .diff extension.
 *
 * Usage: tsx ./scripts/cmd/generate-ja-sample-diffs.mts
 */
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { workspaceRootPath } from '../workspace-root-path.mjs';

const sampleDirs: readonly string[] = [
  'samples/docs-site/introduction',
  'samples/docs-site/why-reactive',
] as const;

type DiffOutcome = 'generated' | 'skipped';

/**
 * Writes the .diff file for a single ja/ sample file. Extracted from the
 * enclosing loops so that early exits are plain `return`s rather than `continue`
 * statements in a nested loop.
 */
const generateDiffForFile = async (
  dir: string,
  enDir: string,
  jaDir: string,
  fileName: string,
): Promise<DiffOutcome | undefined> => {
  if (fileName.endsWith('.diff')) return undefined;

  const jaFilePath = path.resolve(jaDir, fileName);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const jaStat = await fs.stat(jaFilePath);

  if (!jaStat.isFile()) return undefined;

  const enFilePath = path.resolve(enDir, fileName);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const enExists = await fs

    .stat(enFilePath)
    .then((s: Readonly<{ isFile: () => boolean }>) => s.isFile())
    .catch(() => false);

  if (!enExists) {
    console.info(`⚠ No English counterpart for ${dir}/ja/${fileName}`);

    return undefined;
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const enContent = await fs.readFile(enFilePath, 'utf8');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const jaContent = await fs.readFile(jaFilePath, 'utf8');

  if (enContent === jaContent) return 'skipped';

  // Use system `diff` for proper unified diff output
  let mut_diffContent: string;

  try {
    execFileSync('diff', [
      '-u',
      `--label=en/${fileName}`,
      `--label=ja/${fileName}`,
      enFilePath,
      jaFilePath,
    ]);

    // diff returns 0 if files are identical (shouldn't reach here)
    return 'skipped';
  } catch (error: unknown) {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    const execError = error as Readonly<{
      status: number;
      stdout: Buffer;
    }>;

    if (execError.status !== 1) {
      console.error(`❌ diff failed for ${fileName}`);

      return undefined;
    }

    // Exit code 1 = files differ (normal)
    mut_diffContent = execError.stdout.toString('utf8');
  }

  const diffPath = path.resolve(jaDir, `${fileName}.diff`);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(diffPath, mut_diffContent, 'utf8');

  console.info(`✓ ${dir}/ja/${fileName}.diff`);

  return 'generated';
};

const mut_outcomes: (DiffOutcome | undefined)[] = [];

for (const dir of sampleDirs) {
  const enDir = path.resolve(workspaceRootPath, dir);

  const jaDir = path.resolve(enDir, 'ja');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const jaDirExists = await fs

    .stat(jaDir)
    .then((s: Readonly<{ isDirectory: () => boolean }>) => s.isDirectory())
    .catch(() => false);

  if (!jaDirExists) {
    console.info(`⚠ No ja/ directory found in ${dir}. Skipping.`);

    continue;
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const jaFiles = await fs.readdir(jaDir);

  for (const fileName of jaFiles) {
    mut_outcomes.push(await generateDiffForFile(dir, enDir, jaDir, fileName));
  }
}

const generated = mut_outcomes.filter((o) => o === 'generated').length;

const skipped = mut_outcomes.filter((o) => o === 'skipped').length;

console.info(
  `\n✓ Generated ${String(generated)} diff file(s), skipped ${String(skipped)} identical file(s).`,
);
