// NOTE: This file is added to avoid an error from `import-x/no-unused-modules` rule below:
//
// > Due to the exclusion of certain internal ESLint APIs when using flat config,
// > the import-x/no-unused-modules rule requires an .eslintrc file to know which
// > files to ignore (even when using flat config).
// > The .eslintrc file only needs to contain "ignorePatterns", or can be empty if
// > you do not want to ignore any files.

module.exports = {
  ignorePatterns: [
    '**/node_modules/**',
    'dist',
    'docs',
    'agents/**',
    '.eslintrc.cjs',
  ],
};
