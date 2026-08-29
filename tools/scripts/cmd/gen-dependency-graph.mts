import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, isRecord, isString, Obj, unknownToString } from 'ts-data-forge';
import { formatFiles, glob, isDirectlyExecuted, Result } from 'ts-repo-utils';
import { type FixedLengthTuple, type ReadonlyRecord } from 'ts-type-forge';
import { projectRootPath } from '../project-root-path.mjs';

const outputPath = path.resolve(
  projectRootPath,
  'docs/package-dependencies.md',
);

/**
 * Regenerates `docs/package-dependencies.md`: the dependency graph between the
 * packages in this repository, rendered as mermaid, plus the build stages that
 * `pnpm run ws:build` derives from it.
 */
export const genDependencyGraph = async (): Promise<
  Result<undefined, string>
> => {
  try {
    const packages = await readWorkspacePackages();

    const names = new Set(packages.map((pkg) => pkg.name));

    const runtimeCycle = findCycle(packages, (pkg) =>
      internal(pkg.runtime, names),
    );

    if (runtimeCycle !== undefined) {
      return Result.err(
        `❌ The runtime dependency graph has a cycle: ${runtimeCycle.join(' -> ')}`,
      );
    }

    const root = await readPackage(projectRootPath);

    if (root === undefined) {
      return Result.err('❌ Could not read the root package.json.');
    }

    const output = render(packages, names, root);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(outputPath, output, 'utf8');

    // The tables are rendered without padding the cells, so the file has to be
    // formatted before it matches what is committed. Without this the output
    // differs from the checked-in file on every run, which makes regeneration
    // useless as a drift check.
    const formatted = await formatFiles([outputPath], { silent: true });

    if (Result.isErr(formatted)) {
      return Result.err(
        `❌ Failed to format ${path.relative(projectRootPath, outputPath)}.`,
      );
    }

    console.info(
      `Successfully generated ${path.relative(projectRootPath, outputPath)}.`,
    );

    return Result.ok(undefined);
  } catch (error) {
    return Result.err(
      `❌ Failed to generate the dependency graph: ${unknownToString(error)}`,
    );
  }
};

type PackageInfo = Readonly<{
  name: string;
  dir: string;
  runtime: ReadonlyRecord<string, string>;
  dev: ReadonlyRecord<string, string>;
  peer: ReadonlyRecord<string, string>;
}>;

const workspaceGlobs = ['libs/*', 'apps/*', 'tools/*'] as const;

const readWorkspacePackages = async (): Promise<readonly PackageInfo[]> => {
  const dirLists = await Promise.all(
    workspaceGlobs.map(async (pattern) => {
      const result = await glob(pattern, {
        cwd: projectRootPath,
        onlyDirectories: true,
        absolute: true,
      });

      return Result.isErr(result) ? [] : result.value;
    }),
  );

  const infos = await Promise.all(dirLists.flat().toSorted().map(readPackage));

  return infos.filter((info) => info !== undefined);
};

const readPackage = async (dir: string): Promise<PackageInfo | undefined> => {
  const result = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(path.join(dir, 'package.json'), 'utf8'),
  );

  if (Result.isErr(result)) return undefined;

  const parsed: unknown = JSON.parse(result.value);

  if (!isRecord(parsed) || typeof parsed['name'] !== 'string') return undefined;

  return {
    name: parsed['name'],
    dir: path.relative(projectRootPath, dir),
    runtime: stringRecord(parsed['dependencies']),
    dev: stringRecord(parsed['devDependencies']),
    peer: stringRecord(parsed['peerDependencies']),
  };
};

const stringRecord = (value: unknown): ReadonlyRecord<string, string> =>
  isRecord(value) ? Obj.filter(value, isString) : {};

/** Keeps only the entries that name a package in this repository. */
const internal = (
  deps: ReadonlyRecord<string, string>,
  names: ReadonlySet<string>,
): readonly FixedLengthTuple<2, string>[] =>
  Object.entries(deps).filter(([name]) => names.has(name));

/**
 * The edge set `ws:build` orders by: `dependencies` + `peerDependencies`, as
 * passed to `runCmdInStagesAcrossWorkspaces` via `dependencyFields`. Shown
 * alongside the graph that includes `devDependencies`, which has no
 * topological order.
 */
const buildEdges = (
  pkg: PackageInfo,
  names: ReadonlySet<string>,
): readonly FixedLengthTuple<2, string>[] =>
  internal({ ...pkg.runtime, ...pkg.peer }, names);

/** Every declared edge, including development-only ones. */
const allEdges = (
  pkg: PackageInfo,
  names: ReadonlySet<string>,
): readonly FixedLengthTuple<2, string>[] =>
  internal({ ...pkg.runtime, ...pkg.dev, ...pkg.peer }, names);

/** Groups packages into stages; returns undefined if the graph has a cycle. */
const toStages = (
  packages: readonly PackageInfo[],
  edgesOf: (pkg: PackageInfo) => readonly FixedLengthTuple<2, string>[],
): readonly (readonly string[])[] | undefined => {
  const mut_stages: string[][] = [];

  const mut_placed = new Set<string>();

  const mut_remaining = Array.from(packages);

  while (Arr.isNonEmpty(mut_remaining)) {
    const ready = mut_remaining.filter((pkg) =>
      edgesOf(pkg).every(([dep]) => dep === pkg.name || mut_placed.has(dep)),
    );

    if (!Arr.isNonEmpty(ready)) return undefined;

    mut_stages.push(ready.map((pkg) => pkg.name));

    for (const pkg of ready) {
      mut_placed.add(pkg.name);

      mut_remaining.splice(mut_remaining.indexOf(pkg), 1);
    }
  }

  return mut_stages;
};

/** Returns one cycle as a list of package names, or undefined if acyclic. */
const findCycle = (
  packages: readonly PackageInfo[],
  edgesOf: (pkg: PackageInfo) => readonly FixedLengthTuple<2, string>[],
): readonly string[] | undefined => {
  const byName = new Map(packages.map((pkg) => [pkg.name, pkg]));

  const mut_done = new Set<string>();

  const walk = (
    name: string,
    trail: readonly string[],
  ): readonly string[] | undefined => {
    if (trail.includes(name))
      return Arr.toPushed(trail.slice(trail.indexOf(name)), name);

    if (mut_done.has(name)) return undefined;

    const pkg = byName.get(name);

    if (pkg !== undefined) {
      for (const [dep] of edgesOf(pkg)) {
        if (dep === name) continue;

        const found = walk(dep, Arr.toPushed(trail, name));

        if (found !== undefined) return found;
      }
    }

    mut_done.add(name);

    return undefined;
  };

  for (const pkg of packages) {
    const found = walk(pkg.name, []);

    if (found !== undefined) return found;
  }

  return undefined;
};

const render = (
  packages: readonly PackageInfo[],
  names: ReadonlySet<string>,
  root: PackageInfo,
): string => {
  const rootInternal = internal({ ...root.runtime, ...root.dev }, names);

  const buildStages = toStages(packages, (pkg) => buildEdges(pkg, names));

  const allStages = toStages(packages, (pkg) => allEdges(pkg, names));

  const linked = packages.filter((pkg) =>
    allEdges(pkg, names).some(([, spec]) => spec.startsWith('workspace:')),
  );

  return [
    '<!-- AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY. -->',
    '<!-- Regenerate with `pnpm run docs:deps`. -->',
    '',
    '# パッケージ間の依存関係',
    '',
    `このリポジトリの workspace パッケージは ${packages.length} 個。`,
    'グラフは各 `package.json` から生成している。',
    '',
    '## 実行時依存（`dependencies` + `peerDependencies`）',
    '',
    '公開されるパッケージの依存関係。非循環であることを生成時に検証している。',
    '',
    '```mermaid',
    'graph LR',
    ...mermaidEdges(packages, (pkg) =>
      internal({ ...pkg.runtime, ...pkg.peer }, names),
    ),
    '```',
    '',
    '## ビルド順',
    '',
    '`pnpm run ws:build` は `runCmdInStagesAcrossWorkspaces` に',
    "`dependencyFields: ['dependencies', 'peerDependencies']` を渡す。",
    'ビルドを走らせるのに必要なのは「公開されるソースが型として import する',
    'パッケージ」だけで、devDependency が指す先（lint・テスト・スクリプトの',
    'ツールチェーン）は全パッケージのビルドが終わってから使われるためである。',
    '',
    ...stageTable('`ws:build` が使う段階', buildStages),
    '',
    ...stageTable('参考: devDependencies も含めた場合', allStages),
    '',
    '## `workspace:` プロトコルの状況',
    '',
    '| パッケージ | 種別 | 内部依存 |',
    '| :--- | :--- | :--- |',
    ...packages.flatMap((pkg) => {
      const rows = (
        [
          ['dep', pkg.runtime],
          ['peer', pkg.peer],
          ['dev', pkg.dev],
        ] as const
      ).flatMap(([kind, deps]) => {
        const edges = internal(deps, names);

        return Arr.isNonEmpty(edges)
          ? [
              `| \`${pkg.name}\` | ${kind} | ${edges
                .map(([name, spec]) => `\`${name}\`&nbsp;\`${spec}\``)
                .join('<br>')} |`,
            ]
          : [];
      });

      return Arr.isNonEmpty(rows) ? rows : [`| \`${pkg.name}\` | — | — |`];
    }),
    '',
    `${linked.length} / ${packages.length} のパッケージが少なくとも 1 つの内部依存を \`workspace:\` で解決している。`,
    '',
    '### root（`package.json`、非公開）',
    '',
    'root はワークスペースメンバーではないので、上のビルド順グラフには現れない。',
    'ここに並ぶのはリポジトリ自身の lint / codemod / 設定適用に使うツールチェーン。',
    '',
    '| パッケージ | 指定 |',
    '| :--- | :--- |',
    ...rootInternal.map(([name, spec]) => `| \`${name}\` | \`${spec}\` |`),
    '',
    ...cycleNotes,
  ].join('\n');
};

/**
 * Hand-written analysis that accompanies the generated tables. Kept here so the
 * document is regenerated as a whole rather than hand-edited.
 */
const cycleNotes: readonly string[] = [
  '## 内部依存はすべて `workspace:` である',
  '',
  '自作パッケージを npm の公開版で参照している箇所はもう無い。',
  '`pnpm install` 直後（`dist/` がまだ 1 つも無い状態）から `pnpm run ws:build`',
  'が通る。',
  '',
  'これを可能にしているのは 3 つの仕組み。',
  '',
  '### 1. `tsx` の解決先をソースへ向ける',
  '',
  'ビルドスクリプトは `ts-repo-utils` や `ts-data-forge` を**実行**する。',
  'パッケージ名で解決すると `dist/` が要り、`ts-type-forge`（第 1 段階）の',
  'ビルドが `ts-data-forge`（第 2 段階）を必要とする循環になる。',
  '',
  '`tools/configs/tsconfig.tsx.json` がこれらの名前をソースへ写像し、',
  'すべての `tsx` 起動が `--tsconfig` でそれを読む。`tsx` がその場で',
  'トランスパイルするので `dist/` は不要で、import 文は変えずに済む。',
  '',
  '自作 CLI（`gen-index-ts` / `format-uncommitted` / `repo-settings` …）も',
  '`node_modules/.bin` の実体ではなく CLI ソースを `tsx` 経由で呼ぶ。',
  'ビルド前に走る CI ステップ（`check-should-run-type-checks` など）が',
  'これに当たる。',
  '',
  '### 2. ビルドは公開するものだけを型チェックする',
  '',
  '`build` から全スコープの `tsc --noEmit` を外した。宣言生成',
  '（`configs/tsconfig.build.json`、型チェック設定を継承している）が `src/` を',
  '検証しており、外れるのは test・scripts・configs・lint 設定という',
  '「後段のツールチェーンを import する support code」だけである。',
  '',
  'それらは全パッケージのビルド後に `pnpm run ws:type-check` が検証する',
  '（`check-all` にも入れてある）。',
  '',
  '### 3. ビルド順は実行時依存だけで決める',
  '',
  '各パッケージは自分が使うツールチェーンを devDependency として',
  '`workspace:*` で宣言している。`eslint-config-typed` は `ts-data-forge` に',
  '依存するので、これは必ず循環する。',
  '',
  '`runCmdInStagesAcrossWorkspaces` の `dependencyFields` で',
  'ビルド順を `dependencies` + `peerDependencies` に限定することで、',
  '循環した宣言のまま有効な順序が得られる。上の 2 つの段階表を比べると',
  '効果が分かる。',
  '',
  'アプリのように**ビルドに必要**な workspace パッケージは、',
  'devDependencies ではなく `dependencies` に置く必要がある',
  '（`@synstate/docs` がこれに当たる）。',
  '',
  '## 依存を過不足なく宣言する',
  '',
  '各パッケージの `eslint.config.mts` は `packageDirs` に自分のディレクトリ',
  'だけを渡す。root の `package.json` は含めないので、',
  '`import-x/no-extraneous-dependencies` が「自分で宣言していない import」を',
  'エラーにする。`scripts/**` と `configs/**` でこのルールを無効化していた',
  'override も外してある。',
  '',
  '検証されない箇所が 1 つだけある: `eslint.config.mts` 自身は',
  '`eslint-config-typed` が既定で ignore しているため lint されない。',
  'そこから import する `eslint-config-typed` と `eslint-plugin-ts-*` は',
  '規約として明示的に宣言している。',
  '',
  'バージョンは `pnpm-workspace.yaml` の `catalog:` が単一の情報源。',
  '各パッケージは `"eslint": "catalog:"` と書く。公開パッケージの',
  '`dependencies` / `peerDependencies` はそのパッケージの API なので',
  'カタログ化せず、レンジをそのまま書く。',
  '',
];

const mermaidEdges = (
  packages: readonly PackageInfo[],
  edgesOf: (pkg: PackageInfo) => readonly FixedLengthTuple<2, string>[],
): readonly string[] => {
  const lines = packages.flatMap((pkg) =>
    edgesOf(pkg).map(([dep]) => `  ${id(pkg.name)} --> ${id(dep)}`),
  );

  const declarations = packages.map(
    (pkg) => `  ${id(pkg.name)}["${pkg.name}"]`,
  );

  return [...declarations, ...lines];
};

const id = (name: string): string => name.replaceAll(/[^a-zA-Z0-9]/gu, '_');

const stageTable = (
  title: string,
  stages: readonly (readonly string[])[] | undefined,
): readonly string[] =>
  stages === undefined
    ? [`### ${title}`, '', '循環があり、段階に分解できない。', '']
    : [
        `### ${title}`,
        '',
        '| 段階 | パッケージ |',
        '| ---: | :--- |',
        ...stages.map(
          (stage, i) =>
            `| ${i + 1} | ${stage.map((name) => `\`${name}\``).join(', ')} |`,
        ),
      ];

if (isDirectlyExecuted(import.meta.url)) {
  const result = await genDependencyGraph();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }
}
