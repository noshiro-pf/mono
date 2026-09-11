const config = {
  globs: ['**/*.md'],

  // Every exclusion lives here rather than as a `globs` negation, and the
  // difference is not stylistic. A `globs` negation is matched against the
  // path as written, so one anchored at the cwd -- `!articles/**/*` -- cannot
  // match a file named on the command line as an absolute path; that file is
  // linted, and with `fix: true` linted means rewritten. `ignores` has no such
  // gap: markdownlint-cli2 appends these to the glob patterns itself (so the
  // discovery walk is pruned exactly as before) *and* applies them again after
  // discovery, to whatever was collected however it was named. They also
  // survive `--no-globs`, which drops `globs` but keeps `ignores`.
  //
  // This is what kept giving `articles/` and `experimental/` unexplained
  // `*` -> `-` list-marker changes that no repository script could reproduce:
  // every script passes relative globs, and an editor plugin linting the open
  // document passes an absolute path.
  ignores: [
    '**/node_modules',
    '**/dist/**/*',
    '**/docs/**/*',
    '**/CHANGELOG.md',
    // --- mono-specific ---
    // Zenn content. Zenn's front matter and Markdown dialect do not match
    // markdownlint's defaults, and these files are published as-is.
    'articles/**/*',
    'books/**/*',
    // Legacy monorepo contents, excluded from the pnpm workspace.
    'experimental/**/*',
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
