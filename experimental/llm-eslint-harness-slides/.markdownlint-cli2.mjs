const config = {
  globs: [
    '**/*.md',
    '!node_modules',
    '!dist/**/*',
    '!docs/**/*',
    '!agents/**/*',
    '!CHANGELOG.md',
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
    'no-inline-html': false, // allow HTML for links and formatting
    // Marp スライドは 1 ファイル内に複数の h1 を持つ（スライドごとのタイトル）
    'single-title': false,
    'single-h1': false,
    // Marp スライドではセクション内の小見出しを `**bold**` で表現することがある
    'no-emphasis-as-heading': false,
    // ASCII アート的なコードフェンスに言語指定を強制しない
    'fenced-code-language': false,
    // Prettier の table 整形と衝突するため無効化
    'table-column-style': false,
  },
};

export default config;
