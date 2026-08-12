const config = {
  globs: [
    '**/*.md',
    '!**/node_modules',
    '!**/dist/**/*',
    '!**/docs/**/*',
    '!**/CHANGELOG.md',
    // --- mono-specific ---
    // Zenn content. Zenn's front matter and Markdown dialect do not match
    // markdownlint's defaults, and these files are published as-is.
    '!articles/**/*',
    '!books/**/*',
    // Legacy monorepo contents, excluded from the pnpm workspace.
    '!experimental/**/*',
  ],
  prettier: true,
  fix: true,

  /** @type {import("markdownlint").Configuration} */
  config: {
    default: true,
    'line-length': false, // prefer Prettier's setting
    'list-indent': false, // prefer Prettier's setting
    'code-block-style': false, // prefer Prettier's setting
    'first-line-h1': false,
    'first-line-heading': false,
    'ol-prefix': false,
    indentation: false, // prefer Prettier's setting
    'ul-indent': false, // prefer Prettier's setting
    'ol-indent': false, // prefer Prettier's setting
    'list-marker-space': false, // prefer Prettier's setting
    'no-duplicate-heading': { siblings_only: true },
    'no-inline-html': false,
  },
};

export default config;
