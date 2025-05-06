import core from '@actions/core';
import github from '@actions/github';
import { Bumper } from 'conventional-recommended-bump';
import { exec } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import semver from 'semver';
import packageJson from '../package.json' with { type: 'json' };
import { gitUserEmail, gitUserName } from './release-workflow-shared.mjs';
import { execAsync } from './utils.mjs';

const mainBranch = 'main';
const releaseBranch = 'release';
const releaseCandidateBranch = 'release-candidate';
const changelogPath = 'CHANGELOG.md';
const packageJsonPath = 'package.json';

const bumper = new Bumper(process.cwd()).loadPreset('angular');

const prepareRelease = async () => {
  try {
    core.info('Starting prepare-release process...');

    // Git user settings
    await execAsync(`git config user.name "${gitUserName}"`);
    await execAsync(`git config user.email "${gitUserEmail}"`);

    // Fetch all history (fetch-depth: 0 recommended in the workflow)
    core.info('Fetching all git history...');
    // await execAsync('git fetch --prune --unshallow'); // Just in case

    const latestTag = await getLatestTag();

    const nextVersion = await calcNextVersion(latestTag);

    const nextTag = `v${nextVersion}`;
    core.info(`Next version: ${nextVersion} (${nextTag})`);

    // Generate CHANGELOG (recent versions only)
    const newChangelogContent = await genNewChangelogContent();

    // Load existing CHANGELOG and add new content (handle version headers, etc. appropriately)
    const existingChangelog = await getExistingChangelog();

    // Simple append example here. More advanced insertion logic might be needed.
    // Example: Insert before the existing latest version, etc.
    // Assuming the generated content includes the header for the latest version.
    const fullChangelog = [
      newChangelogContent,
      existingChangelog.replace(/^# Changelog\n\n/u, ''),
    ].join('\n');

    // Create or update the release-candidate branch
    core.info(`Checking out ${mainBranch}...`);
    await execAsync(`git fetch origin ${mainBranch}`);
    await execAsync(`git checkout ${mainBranch}`);

    core.info(`Creating/updating ${releaseCandidateBranch} branch...`);
    try {
      // Delete existing branch (alternative to force push)
      await execAsync(`git push origin --delete ${releaseCandidateBranch}`);
    } catch {
      core.info(`${releaseCandidateBranch} branch does not exist remotely.`);
    }
    await execAsync(`git checkout -b ${releaseCandidateBranch}`);

    // Update package.json version
    packageJson.version = nextVersion;
    await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

    core.info(`Updated ${packageJsonPath} to version ${nextVersion}`);

    // Update CHANGELOG.md (if appending)
    await writeFile(changelogPath, fullChangelog);
    core.info(`Updated ${changelogPath}`);

    // Commit changes
    core.info('Committing changes...');
    await execAsync(`git add ${packageJsonPath} ${changelogPath}`);
    await execAsync(
      `git commit -m "chore(release): prepare release ${nextTag}"`,
    );

    // Push the release-candidate branch (force)
    core.info(`Pushing ${releaseCandidateBranch} branch...`);
    await execAsync(`git push --force origin ${releaseCandidateBranch}`);

    // Create/Update Pull Request
    const token = process.env['GITHUB_TOKEN'];

    if (token === undefined) {
      throw new Error('GITHUB_TOKEN is not set.');
    }

    const octokit = github.getOctokit(token);
    const context = github.context;

    const prTitle = `chore(release): prepare release ${nextTag}`;
    const prBody = `This PR prepares the release of version ${nextTag}.\n\n## Changes\n\n${newChangelogContent}`;

    let existingPr;
    try {
      const { data: pulls } = await octokit.rest.pulls.list({
        ...context.repo,
        head: `${context.repo.owner}:${releaseCandidateBranch}`,
        base: releaseBranch,
        state: 'open',
      });
      existingPr = pulls[0];
    } catch (error) {
      core.error(`Error listing pull requests: ${String(error)}`);
    }

    if (existingPr !== undefined) {
      core.info(`Updating existing PR #${existingPr.number}`);
      await octokit.rest.pulls.update({
        ...context.repo,
        pull_number: existingPr.number,
        title: prTitle,
        body: prBody,
      });
    } else {
      core.info('Creating new PR');
      await octokit.rest.pulls.create({
        ...context.repo,
        title: prTitle,
        head: releaseCandidateBranch,
        base: releaseBranch,
        body: prBody,
      });
    }

    // Format code after changes
    await execAsync('npm run fmt');

    core.info('Prepare-release process completed successfully.');
  } catch (error) {
    core.setFailed(`Prepare-release failed: ${getMessage(error)}`);
    console.error(error); // Log detailed error
  }
};

// Based on node_modules/semver/internal/constants.js
/**
 * Checks if a string is a valid semver release type.
 * @param {string} type - The string to check.
 * @returns {type is semver.ReleaseType} - True if it's a valid release type.
 */
const isReleaseType = (type) =>
  semver.RELEASE_TYPES.map((a) => a.toString()).includes(type);

/**
 * Gets the latest semantic version tag from the release branch.
 * @returns {Promise<`v${string}.${string}.${string}`>} - A promise that resolves with the latest tag (e.g., "v1.2.3").
 */
const getLatestTag = async () => {
  try {
    // Get the latest semantic versioning tag that exists in the release branch
    const result = await execAsync(
      `git describe --tags --abbrev=0 --match="v[0-9]*.[0-9]*.[0-9]*" $(git rev-list -n 1 ${releaseBranch})`,
    );

    const latestTag = result.toString().trim();

    if (!isSemver(latestTag)) {
      console.error(
        `Invalid tag format: ${latestTag}. Expected format: vX.Y.Z`,
      );

      return 'v0.0.0'; // For the first release
    }

    core.info(`Latest tag on ${releaseBranch}: ${latestTag}`);
    return latestTag;
  } catch {
    core.warning(
      `Could not find previous tag on ${releaseBranch}. Assuming initial release.`,
    );
    return 'v0.0.0'; // For the first release
  }
};

/**
 * Calculates the next version based on conventional commits since the latest tag.
 * @param {string} latestTag - The latest semantic version tag (e.g., "v1.2.3").
 * @returns {Promise<string>} - A promise that resolves with the next version string (e.g., "1.3.0").
 */
const calcNextVersion = async (latestTag) => {
  const bump = await bumper.bump();

  const currentVersion = semver.clean(latestTag);
  if (currentVersion === null) {
    throw new Error(
      `Invalid version format: ${latestTag}. Expected format: vX.Y.Z`,
    );
  }

  if (bump.releaseType === undefined || !isReleaseType(bump.releaseType)) {
    throw new Error(
      `Invalid release type: ${bump.releaseType}. Expected one of: ${semver.RELEASE_TYPES.join(
        ', ',
      )}`,
    );
  }

  const nextVersion = semver.inc(currentVersion, bump.releaseType);
  if (nextVersion === null) {
    throw new Error(
      `Could not determine next version from ${currentVersion} and ${bump.releaseType}`,
    );
  }

  return nextVersion;
};

/**
 * Generates the changelog content for the latest release using conventional-changelog-cli.
 * @returns {Promise<string>} - A promise that resolves with the new changelog content.
 */
const genNewChangelogContent = async () => {
  // Generate CHANGELOG (only for the most recent version)
  // conventional-changelog-cli is typically used with pipes
  const changelogStream = exec(
    `npx conventional-changelog-cli -p angular --commit-path . --tag-prefix v`,
  ); // use exec for stream

  /** @type {string[]} */
  const newChangelogContent = [];

  changelogStream.stdout?.on('data', (data) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    newChangelogContent.push(data.toString());
  });

  await new Promise((resolve, reject) => {
    changelogStream.on('close', (code) => {
      if (code !== 0) {
        reject(`conventional-changelog-cli exited with code ${code}`);
      } else {
        resolve(undefined);
      }
    });
  });

  return newChangelogContent.join('');
};

/**
 * Reads the existing CHANGELOG.md file.
 * @returns {Promise<string>} - A promise that resolves with the content of the file, or a default header if not found.
 */
const getExistingChangelog = async () => {
  try {
    return await readFile(changelogPath, 'utf8');
  } catch {
    core.warning('CHANGELOG.md not found. Creating a new one.');
    return '# Changelog\n\n'; // Create new if not found
  }
};

/**
 * @param {unknown} error
 * @returns
 */
const getMessage = (error) => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

/**
 * @param {string} str
 * @return {str is `v${string}.${string}.${string}` }
 */
const isSemver = (str) => /^v\d+\.\d+\.\d+$/u.test(str);

await prepareRelease();
