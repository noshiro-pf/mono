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

let mut_generated = 0;

let mut_skipped = 0;

for (const dir of sampleDirs) {
  const enDir = path.resolve(workspaceRootPath, dir);

  const jaDir = path.resolve(enDir, 'ja');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const jaDirExists = await fs

    .stat(jaDir)
    .then((s: Readonly<{ isDirectory: () => boolean }>) => s.isDirectory())
    .catch(() => false);

  if (!jaDirExists) {
    console.log(`⚠ No ja/ directory found in ${dir}. Skipping.`);

    continue;
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const jaFiles = await fs.readdir(jaDir);

  for (const fileName of jaFiles) {
    if (fileName.endsWith('.diff')) continue;

    const jaFilePath = path.resolve(jaDir, fileName);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const jaStat = await fs.stat(jaFilePath);

    if (!jaStat.isFile()) continue;

    const enFilePath = path.resolve(enDir, fileName);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const enExists = await fs

      .stat(enFilePath)
      .then((s: Readonly<{ isFile: () => boolean }>) => s.isFile())
      .catch(() => false);

    if (!enExists) {
      console.log(`⚠ No English counterpart for ${dir}/ja/${fileName}`);

      continue;
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const enContent = await fs.readFile(enFilePath, 'utf8');

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const jaContent = await fs.readFile(jaFilePath, 'utf8');

    if (enContent === jaContent) {
      mut_skipped += 1;

      continue;
    }

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
      mut_skipped += 1;

      continue;
    } catch (error: unknown) {
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      const execError = error as Readonly<{
        status: number;
        stdout: Buffer;
      }>;

      if (execError.status === 1) {
        // Exit code 1 = files differ (normal)
        mut_diffContent = execError.stdout.toString('utf8');
      } else {
        console.error(`❌ diff failed for ${fileName}`);

        continue;
      }
    }

    const diffPath = path.resolve(jaDir, `${fileName}.diff`);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(diffPath, mut_diffContent, 'utf8');

    console.log(`✓ ${dir}/ja/${fileName}.diff`);

    mut_generated += 1;
  }
}

console.log(
  `\n✓ Generated ${String(mut_generated)} diff file(s), skipped ${String(mut_skipped)} identical file(s).`,
);
