import core from '@actions/core';
import { execSync } from 'node:child_process';
import packageJson from '../package.json' with { type: 'json' };
import { gitUserEmail, gitUserName } from './release-workflow-shared.mjs';
import { execAsync } from './utils.mjs';

const release = async () => {
  try {
    core.info('Starting release process...');

    // Git user settings
    await execAsync(`git config user.name "${gitUserName}"`);
    await execAsync(`git config user.email "${gitUserEmail}"`);

    // Get version from package.json
    const version = packageJson.version;
    const tagName = `v${version}`;
    core.info(`Releasing version ${version} (${tagName})`);

    // 1. npm publish
    const npmToken = core.getInput('npm-token', { required: true });
    core.setSecret(npmToken); // Mask the token
    core.info('Publishing to npm...');
    // Set token in .npmrc
    await execAsync(
      `echo "//registry.npmjs.org/:_authToken=${npmToken}" > .npmrc`,
    );
    await execAsync('npm publish');
    core.info('Successfully published to npm.');
    await execAsync('rm .npmrc'); // Remove temporary file

    // 2. Push Git tag
    core.info(`Checking if tag ${tagName} exists...`);
    try {
      await execAsync(`git rev-parse ${tagName}`);
      core.info(`Tag ${tagName} already exists. Skipping tag creation.`);
    } catch {
      core.info(`Tag ${tagName} does not exist. Creating tag...`);
      await execAsync(`git tag ${tagName}`);
      core.info(`Pushing tag ${tagName}...`);
      await execAsync(`git push origin ${tagName}`);
      core.info(`Tag ${tagName} pushed successfully.`);
    }

    // 3. Update GitHub Release Note
    const githubToken = process.env['GITHUB_TOKEN'];

    if (githubToken === undefined) {
      throw new Error('GITHUB_TOKEN is not set.');
    }

    core.setSecret(githubToken); // Mask the token
    core.info('Creating/Updating GitHub Release Note...');
    // Execute conventional-github-releaser
    // Execute with token set in environment variables
    try {
      // Match preset to angular (or the convention being used)
      execSync(`npx conventional-github-releaser -p angular --pkg .`, {
        env: {
          ...process.env, // Inherit existing environment variables
          CONVENTIONAL_GITHUB_RELEASER_TOKEN: githubToken,
        },
      });
      core.info('GitHub Release Note created/updated successfully.');
    } catch (error) {
      core.warning(
        `conventional-github-releaser failed: ${getMessage(error)}. This might happen if the tag was just created.`,
      );
      // This can error if the release already exists, so keep it as a warning
      // Adjust error handling as needed
    }

    core.info('Release process completed successfully.');
  } catch (error) {
    core.setFailed(`Release failed: ${getMessage(error)}`);
    console.error(error); // Log detailed error
    // Add rollback logic if needed, e.g., if tag creation fails after npm publish
  }
};

/**
 * Gets the error message.
 * @param {unknown} error - The error object.
 * @returns {string} - The error message as a string.
 */
const getMessage = (error) => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

await release();
