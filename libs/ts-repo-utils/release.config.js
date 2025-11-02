export default {
  branches: ['main'],
  plugins: [
    // 1. Determine the next version number from commit history.
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          // Standard rules
          { type: 'feat', release: 'minor' },
          { type: 'fix', release: 'patch' },
          { type: 'perf', release: 'patch' },

          // Custom rules for BREAKING CHANGE variations
          { breaking: true, release: 'major' },

          // Additional patterns for major version bumps
          { type: 'feat', scope: 'breaking', release: 'major' },
          { type: 'fix', scope: 'breaking', release: 'major' },
          { type: 'refactor', scope: 'breaking', release: 'major' },

          // Custom notes patterns that should trigger major release
          { type: '*', notes: { breaking: true }, release: 'major' },
        ],
        parserOpts: {
          noteKeywords: [
            'BREAKING CHANGE',
            'BREAKING CHANGES', // Allow plural
            'BREAKING-CHANGE', // Allow hyphen
            'BREAKING_CHANGE', // Allow underscore
          ],
        },
      },
    ],

    // 2. Generate release notes content (text).
    '@semantic-release/release-notes-generator',

    // 3. Write the release notes content generated in step 2 to the Changelog file.
    '@semantic-release/changelog',

    // 4-a. Update the version field in package.json with the next version number.
    // (This happens first so sync-cli-versions can read the new version)
    { path: '@semantic-release/npm', npmPublish: false },

    // 4-b. Sync CLI versions, format, build, and generate docs after version update.
    ['@semantic-release/exec', { prepareCmd: 'pnpm run prepare-release' }],

    // 4-c. Publish the package to npmjs (after all files are updated).
    // 4-d. Run `npm dist-tag` command to add a tag to the package published on npmjs.
    { path: '@semantic-release/npm', npmPublish: true },

    // 5. Commit the changes of assets generated during the release flow to the repository.
    [
      '@semantic-release/git',
      {
        assets: [
          'CHANGELOG.md',
          'package.json',
          'pnpm-lock.yaml',
          'src/cmd/*.mts', // CLI commands with updated versions
          'docs/**/*.md', // Generated documentation
        ],
        message:
          // eslint-disable-next-line no-template-curly-in-string
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],

    // 6. Create a GitHub Release using the release notes content generated in step 2.
    '@semantic-release/github',
  ],
};
