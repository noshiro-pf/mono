// Generates per-file .diff files between each experimental/ package's src/ and
// the src/ of the package it was restored to.
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as prettier from 'prettier';

/**
 * The generated Markdown goes through Prettier so that regenerating never
 * produces a diff of nothing but table padding. `.prettierignore` covers
 * `experimental/`, which is right for the 585 `.diff` files — they are patch
 * text and must stay byte-for-byte — so the repository-wide pass does not
 * reach these indexes and they have to format themselves. Prettier's API on a
 * string does not consult the ignore file.
 */
const formatMarkdown = async (text) =>
  prettier.format(text, {
    ...(await prettier.resolveConfig('README.md')),
    parser: 'markdown',
  });

const repoRoot = process.argv[2];
const outRoot = path.join(repoRoot, 'experimental', 'restore-diff');

/** experimental package dir -> restored package dir (both repo-relative). */
const PAIRS = [
  ['experimental/packages/apps/poll-discord-app', 'apps/poll-discord-app'],
  [
    'experimental/packages/apps/lambda-calculus-interpreter-core',
    'apps/lambda-calculus-interpreter-core',
  ],
  ['experimental/packages/utils/io-ts-types', 'apps/ts-fortress-types'],
  [
    'experimental/packages/apps/event-schedule-app-shared',
    'apps/event-schedule-app-shared',
  ],
  [
    'experimental/packages/utils/better-react-use-state',
    'libs/better-react-use-state',
  ],
  [
    'experimental/packages/utils/tiny-router-observable',
    'apps/tiny-router-observable',
  ],
  [
    'experimental/packages/utils/tiny-router-react-hooks',
    'apps/tiny-router-react-hooks',
  ],
  [
    'experimental/packages/utils/numeric-input-utils',
    'apps/numeric-input-utils',
  ],
  ['experimental/packages/utils/react-utils', 'apps/react-utils'],
  [
    'experimental/packages/utils/resize-observer-react-hooks',
    'apps/resize-observer-react-hooks',
  ],
  ['experimental/packages/utils/react-utils-styled', 'apps/react-utils-styled'],
  [
    'experimental/packages/utils/react-blueprintjs-utils',
    'apps/react-blueprintjs-utils',
  ],
  ['experimental/packages/apps/event-schedule-app', 'apps/event-schedule-app'],
];

/**
 * Pairs the diff tool cannot infer from the path: a file that was renamed for a
 * reason other than the `.ts` -> `.mts` sweep. Keyed by experimental package
 * name, mapping the src-relative path on the experimental side to the one on
 * the restored side.
 */
const RENAMES = {
  // #1631 replaced the tiny observable with synstate: `useTinyObservable` ->
  // `useObservable`.
  'react-utils': {
    'hooks/use-tiny-observable-hooks.mts': 'hooks/use-observable.mts',
  },
};

const CODE_EXT = new Set([
  '.ts',
  '.tsx',
  '.mts',
  '.cts',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
]);

const listFiles = (dir) => {
  const out = [];
  const walk = (d, rel) => {
    for (const e of fs
      .readdirSync(d, { withFileTypes: true })
      .sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const full = path.join(d, e.name);
      const r = rel === '' ? e.name : `${rel}/${e.name}`;
      if (e.isDirectory()) walk(full, r);
      else if (e.isFile()) out.push(r);
    }
  };
  walk(dir, '');
  return out;
};

/** Key that survives the `.ts` -> `.mts` renames: path without a code extension. */
const key = (rel) => {
  const ext = path.extname(rel);
  return CODE_EXT.has(ext) ? rel.slice(0, -ext.length) : rel;
};

const gitDiff = (a, b) => {
  try {
    return execFileSync(
      'git',
      [
        '--no-pager',
        'diff',
        '--no-index',
        '--no-color',
        '--no-ext-diff',
        '--no-prefix',
        '--',
        a,
        b,
      ],
      { cwd: repoRoot, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 },
    );
  } catch (err) {
    if (err.status === 1) return err.stdout;
    throw err;
  }
};

const same = (a, b) => {
  const x = fs.readFileSync(path.join(repoRoot, a));
  const y = fs.readFileSync(path.join(repoRoot, b));
  return x.equals(y);
};

// Clear the previous run's per-package output. `scripts/` and `README.md` live
// under the same root, so the whole directory cannot simply be removed.
for (const [oldDir] of PAIRS) {
  fs.rmSync(path.join(outRoot, path.basename(oldDir)), {
    recursive: true,
    force: true,
  });
}

const summary = [];

for (const [oldDir, newDir] of PAIRS) {
  const oldSrc = path.join(repoRoot, oldDir, 'src');
  const newSrc = path.join(repoRoot, newDir, 'src');
  const oldFiles = listFiles(oldSrc);
  const newFiles = listFiles(newSrc);

  const pkgName = path.basename(oldDir);
  const renames = RENAMES[pkgName] ?? {};

  const oldByKey = new Map(oldFiles.map((f) => [key(renames[f] ?? f), f]));
  const newByKey = new Map(newFiles.map((f) => [key(f), f]));

  const pkgOut = path.join(outRoot, pkgName);

  const rows = {
    changed: 0,
    identical: 0,
    added: 0,
    removed: 0,
    renamedExt: 0,
  };
  const details = [];

  const allKeys = [...new Set([...oldByKey.keys(), ...newByKey.keys()])].sort();

  for (const k of allKeys) {
    const o = oldByKey.get(k);
    const n = newByKey.get(k);
    const relForOut = n ?? o;
    const outFile = path.join(pkgOut, `${relForOut}.diff`);

    if (o !== undefined && n !== undefined) {
      if (o !== n) rows.renamedExt += 1;
      if (same(`${oldDir}/src/${o}`, `${newDir}/src/${n}`)) {
        rows.identical += 1;
        details.push({
          status: o === n ? 'identical' : 'identical (renamed)',
          old: o,
          new: n,
          diff: null,
        });
        continue;
      }
      const text = gitDiff(`${oldDir}/src/${o}`, `${newDir}/src/${n}`);
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, text);
      rows.changed += 1;
      details.push({
        status: 'changed',
        old: o,
        new: n,
        diff: path.relative(outRoot, outFile),
      });
    } else if (n !== undefined) {
      const text = gitDiff('/dev/null', `${newDir}/src/${n}`);
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, text);
      rows.added += 1;
      details.push({
        status: 'added',
        old: null,
        new: n,
        diff: path.relative(outRoot, outFile),
      });
    } else {
      const text = gitDiff(`${oldDir}/src/${o}`, '/dev/null');
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, text);
      rows.removed += 1;
      details.push({
        status: 'removed',
        old: o,
        new: null,
        diff: path.relative(outRoot, outFile),
      });
    }
  }

  summary.push({
    pkgName,
    oldDir,
    newDir,
    rows,
    details,
    oldCount: oldFiles.length,
    newCount: newFiles.length,
  });
}

// --- indexes -------------------------------------------------------------

const pad = (v, n) => String(v).padStart(n);

const overall = summary.reduce(
  (acc, s) => ({
    changed: acc.changed + s.rows.changed,
    identical: acc.identical + s.rows.identical,
    added: acc.added + s.rows.added,
    removed: acc.removed + s.rows.removed,
    oldCount: acc.oldCount + s.oldCount,
    newCount: acc.newCount + s.newCount,
  }),
  { changed: 0, identical: 0, added: 0, removed: 0, oldCount: 0, newCount: 0 },
);

for (const s of summary) {
  const lines = [
    `# \`${s.pkgName}\` — src の差分一覧`,
    '',
    `| | |`,
    `| :--- | :--- |`,
    `| 復元前 | \`${s.oldDir}/src\`（${s.oldCount} ファイル） |`,
    `| 復元後 | \`${s.newDir}/src\`（${s.newCount} ファイル） |`,
    `| 変更あり | ${s.rows.changed} |`,
    `| 同一 | ${s.rows.identical} |`,
    `| 追加 | ${s.rows.added} |`,
    `| 削除 | ${s.rows.removed} |`,
    '',
    '| 状態 | 復元前 | 復元後 | diff |',
    '| :--- | :--- | :--- | :--- |',
  ];

  for (const d of s.details) {
    lines.push(
      `| ${d.status} | ${d.old === null ? '—' : `\`${d.old}\``} | ${d.new === null ? '—' : `\`${d.new}\``} | ${
        d.diff === null
          ? '—'
          : `[\`${path.basename(d.diff)}\`](./${d.diff.split(path.sep).slice(1).join('/')})`
      } |`,
    );
  }

  fs.mkdirSync(path.join(outRoot, s.pkgName), { recursive: true });

  fs.writeFileSync(
    path.join(outRoot, s.pkgName, '_index.md'),
    await formatMarkdown(`${lines.join('\n')}\n`),
  );
}

const readme = [
  '# `experimental/` からの復元 — src のファイル単位差分',
  '',
  '`docs/monorepo-consolidation.md` の step 3「旧 mono の復元」で',
  '`experimental/` から復元した 13 パッケージについて、**復元前の `src/` と',
  '復元後の `src/` を 1 ファイルずつ突き合わせた差分**を置いてある。',
  '',
  '- 1 ファイル 1 `.diff`。パスは**復元後**の `src/` からの相対パスで、',
  '  復元前にしか無いファイルだけ復元前のパスで置いてある',
  '- 内容が同一のファイルには `.diff` を作っていない。一覧は各パッケージの',
  '  `_index.md` にあり、`identical` として載っている',
  '- 対応付けは「拡張子を除いた相対パス」で行っている。`event-schedule-app` の',
  '  `.ts` → `.mts` 190 件のような改名はこれで繋がる。それ以外の改名は',
  '  生成器の `RENAMES` に手で書いてある（現在 1 件）',
  '',
  '## パッケージ別',
  '',
  '| パッケージ | 復元先 | 復元前 | 復元後 | 変更 | 同一 | 追加 | 削除 |',
  '| :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: |',
  ...summary.map(
    (s) =>
      `| [\`${s.pkgName}\`](./${s.pkgName}/_index.md) | \`${s.newDir}\` | ${s.oldCount} | ${s.newCount} | ${s.rows.changed} | ${s.rows.identical} | ${s.rows.added} | ${s.rows.removed} |`,
  ),
  `| **合計** | | **${overall.oldCount}** | **${overall.newCount}** | **${overall.changed}** | **${overall.identical}** | **${overall.added}** | **${overall.removed}** |`,
  '',
  '## 生成',
  '',
  '```sh',
  'node scripts/gen-restore-diff.mjs <repo root>',
  '```',
  '',
  '`experimental/` は pnpm workspace の glob の外にあり、Prettier・cspell・',
  'ESLint・markdownlint のいずれからも除外されているので、ここの内容は',
  'リポジトリのチェックには掛からない。生成器も同じ理由でここに置いてある。',
  '',
].join('\n');

fs.writeFileSync(path.join(outRoot, 'README.md'), await formatMarkdown(`${readme}\n`));

console.log(
  summary
    .map(
      (s) =>
        `${s.pkgName.padEnd(34)} old=${pad(s.oldCount, 3)} new=${pad(s.newCount, 3)} changed=${pad(s.rows.changed, 3)} identical=${pad(s.rows.identical, 3)} added=${s.rows.added} removed=${s.rows.removed}`,
    )
    .join('\n'),
);
