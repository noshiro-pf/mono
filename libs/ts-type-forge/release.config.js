export default {
  branches: ['main'],
  plugins: [
    // 1. Determine the next version number from commit history.
    '@semantic-release/commit-analyzer',

    // 2. Generate release notes content (text).
    '@semantic-release/release-notes-generator',

    // 3. Write the release notes content generated in step 2 to the Changelog file.
    '@semantic-release/changelog',

    // 4. Run prettier and build before committing.
    ['@semantic-release/exec', { prepareCmd: 'npm run fmt && npm run build' }],

    // 4-a. Update the version field in package.json with the next version number.
    // 4-b. Publish the package to npmjs.
    // 4-c. Run `npm dist-tag` command to add a tag to the package published on npmjs.
    '@semantic-release/npm',

    // 5. Commit the changes of assets generated during the release flow to the repository.
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json', 'package-lock.json'],
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],

    // 6. Create a GitHub Release using the release notes content generated in step 2.
    '@semantic-release/github',
  ],
};
