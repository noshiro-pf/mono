import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, isRecord, unknownToString } from 'ts-data-forge';
import { glob, isDirectlyExecuted, Result } from 'ts-repo-utils';
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
  !isRecord(value)
    ? {}
    : Object.fromEntries(
        Object.entries(value).flatMap(([key, spec]) =>
          typeof spec === 'string' ? [[key, spec] as const] : [],
        ),
      );

/** Keeps only the entries that name a package in this repository. */
const internal = (
  deps: ReadonlyRecord<string, string>,
  names: ReadonlySet<string>,
): readonly FixedLengthTuple<2, string>[] =>
  Object.entries(deps).filter(([name]) => names.has(name));

/**
 * The edge set `ts-repo-utils` uses for `ws:build`: `dependencies`,
 * `devDependencies` and `peerDependencies` merged, matched by package name
 * regardless of the specifier.
 */
const buildEdges = (
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

  const runtimeStages = toStages(packages, (pkg) =>
    internal({ ...pkg.runtime, ...pkg.peer }, names),
  );

  const buildStages = toStages(packages, (pkg) => buildEdges(pkg, names));

  const linked = packages.filter((pkg) =>
    internal({ ...pkg.runtime, ...pkg.dev, ...pkg.peer }, names).some(
      ([, spec]) => spec.startsWith('workspace:'),
    ),
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
    '`pnpm run ws:build`（`runCmdInStagesAcrossWorkspaces`）は',
    '`dependencies` + `devDependencies` + `peerDependencies` を 1 つのグラフに',
    '合成し、**指定子の種類に関わらずパッケージ名だけで**エッジを張る。',
    'したがって内部パッケージへの devDependency もビルド順を拘束する。',
    '',
    ...stageTable('実行時依存だけから決まる段階', runtimeStages),
    '',
    ...stageTable('実際に `ws:build` が使う段階', buildStages),
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
  '## なぜ一部だけ npm 版のままなのか',
  '',
  'root の依存を `workspace:` にすると、そのパッケージは `dist/` を持つまで',
  '解決できなくなる。したがって基準は 1 つ:',
  '',
  '> **`ws:build` より前に動くものが必要とするパッケージは、npm の公開版のまま。**',
  '',
  '該当するのは 5 つ。',
  '',
  '| パッケージ | `ws:build` より前に必要な理由 |',
  '| :--- | :--- |',
  '| `ts-data-forge` | 17 パッケージすべての `scripts/cmd/build.mts` が import する |',
  '| `ts-repo-utils` | 同上。加えて `check-should-run-type-checks` / `assert-repo-is-clean` を CI がビルド前に実行する |',
  '| `ts-type-forge` | 上 2 つの実行時依存 |',
  '| `ts-codemod-lib` | `eslint-config-typed` のビルド中の `gen-rule-type` が実行する |',
  '| `github-settings-as-code` | `backup-repository-settings` workflow が `repo-settings` をビルドせずに実行する |',
  '',
  'lint ツールチェーン（`eslint-config-typed`、`eslint-plugin-ts-*`）はビルド後に',
  'しか使わないので `workspace:` にできる。これでリポジトリは自分自身の lint 設定で',
  'lint されるようになり、変更を publish せずに検証できる。',
  '',
  '### ステージランナーに見えない制約を消す',
  '',
  'lint ツールチェーンをリンクすると、ランナーが知り得ない順序制約が生まれる。',
  '各パッケージの build は自分の `tsconfig.json` で型チェックするが、その対象に',
  'lint 設定が含まれており、lint 設定は lint ツールチェーンを import するためだ。',
  '`eslint-config-typed` は `ts-data-forge` に依存するので同じ段階以降にしか',
  'ビルドされず、依存関係として宣言することもできない（宣言すると循環する）。',
  '',
  '解決は「ビルドの型チェック対象から lint 設定を外す」こと。',
  '',
  '- `eslint.config.mts` を各パッケージの `tsconfig.json` の `include` から除外した。',
  '  17 パッケージ中 7 つは元々そうなっていた。root の `tsconfig.json` が',
  '  `./**/eslint.config*.mts` を含むので、型チェック自体は失われない',
  '- 残る 2 箇所（`ts-data-forge/configs/eslint/`、',
  '  `eslint-config-typed/scripts/gen-eslint-rules/`）は型のみの import なので、',
  '  `paths` でソースに解決させた',
  '- `check-all` の `check:root` を `ws:build` の後ろへ移した',
  '',
  '### 各パッケージの devDependency をリンクしない理由',
  '',
  'ツールチェーンを root ではなく各パッケージの devDependency として',
  '`workspace:*` にすると、`ws:build` の順序が決まらなくなる。ランナーが',
  'devDependency もグラフに含めるため、`ts-data-forge` → `eslint-config-typed` →',
  '`ts-data-forge` のような循環が必ずできるからだ。',
  '',
  '取りうる手は 2 つ。いずれも未着手:',
  '',
  '1. `runCmdInStagesAcrossWorkspaces` に「ビルド順は `dependencies` +',
  '   `peerDependencies` だけで決める」オプションを足す（`ts-repo-utils` 側の変更）',
  '2. 現状どおり root にまとめておく',
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
