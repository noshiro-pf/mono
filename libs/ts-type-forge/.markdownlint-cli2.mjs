export default {
  globs: ['**/*.md', '!node_modules', '!docs/**/*', '!CHANGELOG.md'],
  prettier: true,
  fix: true,

  /** @type {import("markdownlint").Configuration} */
  config: {
    default: true,
    'line-length': false, // prefer Prettier's setting
    'list-indent': false, // prefer Prettier's setting
    'code-block-style': false, // prefer Prettier's setting
    MD041: false,
    indentation: false, // prefer Prettier's setting
    'ul-indent': false, // prefer Prettier's setting
  },
};
