import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { glob } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/** Synchronizes CLI command versions with package.json version. */
const syncCliVersions = async (): Promise<void> => {
  console.log('Synchronizing CLI command versions...\n');

  // Step 1: Read package.json version
  const packageJsonPath = path.resolve(projectRootPath, './package.json');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  const packageJson = JSON.parse(packageJsonContent) as Readonly<{
    version: string;
  }>;

  const targetVersion = packageJson.version;

  console.log(`Target version: ${targetVersion}`);

  // Step 2: Find all CLI command files
  const cmdDir = path.resolve(projectRootPath, './src/cmd');

  const cliFilesResult = await glob('*.mts', { cwd: cmdDir, absolute: true });

  if (Result.isErr(cliFilesResult)) {
    console.log(`❌ Failed to find CLI files: ${String(cliFilesResult.value)}`);

    process.exit(1);
  }

  const cliFiles = cliFilesResult.value;

  console.log(`Found ${cliFiles.length} CLI files to update:`);

  for (const file of cliFiles) {
    console.log(`  - ${path.relative(projectRootPath, file)}`);
  }

  console.log('');

  // Step 3: Update version in each CLI file
  let mut_updatedCount = 0;

  for (const filePath of cliFiles) {
    const relativePath = path.relative(projectRootPath, filePath);

    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const content = await fs.readFile(filePath, 'utf8');

      // Match version pattern in cmd.command definition
      const versionRegex = /(\s+version:\s+["'`])([^"'`]+)(["'`],?)/gu;

      let mut_hasUpdates = false as boolean;

      const updatedContent = content.replaceAll(
        versionRegex,
        (
          match: string,
          prefix: string,
          currentVersion: string,
          suffix: string,
        ) => {
          if (currentVersion !== targetVersion) {
            mut_hasUpdates = true;

            console.log(
              `  ${relativePath}: ${currentVersion} → ${targetVersion}`,
            );

            return `${prefix}${targetVersion}${suffix}`;
          }

          return match;
        },
      );

      if (mut_hasUpdates) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.writeFile(filePath, updatedContent, 'utf8');

        mut_updatedCount += 1;
      } else {
        console.log(`  ${relativePath}: already up to date (${targetVersion})`);
      }
    } catch (error) {
      console.log(`  ❌ Failed to update ${relativePath}: ${String(error)}`);

      process.exit(1);
    }
  }

  console.log('');

  if (mut_updatedCount > 0) {
    console.log(
      `✅ Updated ${mut_updatedCount} CLI command${mut_updatedCount === 1 ? '' : 's'}\n`,
    );
  } else {
    console.log('✅ All CLI commands are already up to date\n');
  }
};

await syncCliVersions();
