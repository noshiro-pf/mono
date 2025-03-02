import {
  castMutable,
  isRecord,
  pipe,
  replaceWithNoMatchCheck,
} from '@noshiro/mono-utils';
import 'zx/globals';
import { type ConverterConfig } from '../convert-dts/common.mjs';
import { typeUtilsName } from '../convert-dts/constants.mjs';
import {
  configs,
  genLib,
  libName,
  license,
  paths,
  repo,
} from './constants.mjs';
import { getPackageDirList } from './get-package-dir-list.mjs';
import { clearDir } from './utils/clear-dir.mjs';
import { getTypeScriptVersion } from './utils/get-typescript-version.mjs';

/** Generate files to `output/packages` */
export const genPackages = async (): Promise<'ok' | 'err'> => {
  // lib ファイル名に基づき package ディレクトリ階層を packages/ に生成し、
  // その直下のディレクトリ名を元に dependencies を生成するために先に実行する
  await Promise.all(configs.map(createPackages));

  await Promise.all([
    ...(genLib ? configs.map(createLib) : []),
    updateRootPackageJson(configs[0]),
  ]);

  return 'ok';
};

/** Generate files in `output/packages` */
const createPackages = async (
  config: ConverterConfig,
): Promise<'err' | 'ok'> => {
  {
    const res = await clearDir(
      paths.strictTsLib[config.useBrandedNumber ? 'outputBranded' : 'output']
        .packages.$,
    );
    if (res === 'err') return 'err';
  }

  const tsVersion = await getStrictLibVersion();

  if (tsVersion === undefined) {
    console.error('tsVersion is undefined');
    return 'err';
  }

  const outDir =
    paths.strictTsLib[config.useBrandedNumber ? 'outputBranded' : 'output']
      .packages.$;

  const typescriptVersion = await getTypeScriptVersion();

  if (typescriptVersion === undefined) {
    console.error('typescriptVersion is undefined');
    return 'err';
  }

  if (!tsVersion.startsWith(typescriptVersion)) {
    console.error(
      `tsVersion should starts with typescriptVersion "${typescriptVersion}"`,
    );
    return 'err';
  }

  const packageDirList = await getPackageDirList();

  console.log(
    'target directories:',
    packageDirList.map((a) => path.resolve(outDir, a.packageRelativePath)),
  );

  await Promise.all(
    packageDirList.map(async ({ filename, packageRelativePath }) => {
      const outputDir = path.resolve(outDir, packageRelativePath);

      try {
        await fs.access(outputDir);
      } catch {
        await fs.mkdir(outputDir, { recursive: true });
      }

      {
        const outputFile = path.resolve(outputDir, 'index.d.ts');

        const content = await fs.readFile(
          path.resolve(
            paths.strictTsLib[
              config.useBrandedNumber ? 'outputBranded' : 'output'
            ].libFiles.$,
            filename,
          ),
          { encoding: 'utf8' },
        );

        await fs.writeFile(
          outputFile,
          pipe(content).chain(
            replaceWithNoMatchCheck(
              /\/\/\/ <reference path="\.\/lib\.(.+)\.d\.ts" \/>/gu,
              '/// <reference lib="$1" />',
              {
                onNotFound: 'off',
              },
            ),
          ).value,
        );

        console.log(`${outputFile} generated.`);
      }

      {
        const tsTypeUtilsVersion = await getTsTypeUtilsVersion();

        const outputFile = path.resolve(outputDir, 'package.json');

        await fs.writeFile(
          outputFile,

          JSON.stringify({
            // eslint-disable-next-line no-restricted-syntax
            name: `${libName}${config.useBrandedNumber ? '-branded' : ''}-${packageRelativePath.replaceAll('/', '-')}`,
            version: tsVersion,
            private: false,
            description: 'Strict TypeScript lib',
            repository: {
              type: 'git',
              url: repo,
            },
            license,
            author: 'noshiro-pf <noshiro.pf@gmail.com>',
            sideEffects: false,
            type: 'module',
            types: './index.d.ts',
            dependencies: {
              [typeUtilsName]: tsTypeUtilsVersion,
            },
            peerDependencies: {
              typescript: '>=4.5.2',
            },
          }),
        );

        console.log(`${outputFile} generated.`);
      }
    }),
  );

  return 'ok';
};

/** Generate files in output/lib */
const createLib = async (config: ConverterConfig): Promise<'ok' | 'err'> => {
  {
    const res = await clearDir(
      paths.strictTsLib[config.useBrandedNumber ? 'outputBranded' : 'output']
        .lib.$,
    );
    if (res === 'err') return 'err';
  }

  {
    const res = await writeLibPackageJson(config.useBrandedNumber);
    if (res === 'err') return 'err';
  }
  {
    const res =
      await $`cp ${path.resolve(paths.strictTsLib.source.scripts.$, 'README.md')} ${paths.strictTsLib.output.lib.$}`;

    if (res.exitCode !== 0) {
      console.error(res.stderr);
      return 'err';
    }
  }
  return 'ok';
};

/** Update root package.json */
const updateRootPackageJson = async (
  config: ConverterConfig,
): Promise<'ok' | 'err'> => {
  const tsVersion = await getStrictLibVersion();

  if (tsVersion === undefined) {
    console.error('tsVersion is undefined');
    return 'err';
  }

  const rootPackageJson = path.resolve(paths.root, 'package.json');

  const packageJsonStr = await fs.readFile(rootPackageJson, {
    encoding: 'utf8',
  });

  const packageJson = JSON.parse(packageJsonStr);

  if (
    isRecord(packageJson) &&
    Object.hasOwn(packageJson, 'devDependencies') &&
    isRecord(packageJson.devDependencies)
  ) {
    for (const key of Object.keys(packageJson.devDependencies)) {
      if (key.startsWith('@typescript/lib-')) {
        // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-dynamic-delete
        delete castMutable(packageJson.devDependencies)[key];
      }
    }

    const tsStrictLibDependencies = await constructTypeScriptLibDependencies(
      tsVersion,
      config.useBrandedNumber,
      'local',
    );

    for (const [key, value] of Object.entries(tsStrictLibDependencies)) {
      if (key.startsWith('@typescript/lib-')) {
        // eslint-disable-next-line functional/immutable-data
        castMutable(packageJson.devDependencies)[key] = value;
      }
    }

    await fs.writeFile(
      rootPackageJson,
      JSON.stringify(packageJson, undefined, 2),
    );
  }

  console.log("root package.json's devDependencies updated.");

  return 'ok';
};

const writeLibPackageJson = async (
  useBrandedNumber: boolean,
): Promise<'ok' | 'err'> => {
  const tsVersion = await getStrictLibVersion();

  if (tsVersion === undefined) {
    console.error('version is undefined');
    return 'err';
  }

  const tsTypeUtilsVersion = await getTsTypeUtilsVersion();

  if (tsTypeUtilsVersion === undefined) {
    console.error('tsTypeUtilsVersion is undefined');
    return 'err';
  }

  const outDir =
    paths.strictTsLib[useBrandedNumber ? 'outputBranded' : 'output'].lib.$;

  try {
    await fs.access(outDir);
  } catch {
    await fs.mkdir(outDir, { recursive: true });
  }

  const outputFile = path.resolve(outDir, 'package.json');

  const name = `${libName}${useBrandedNumber ? '-branded' : ''}`;

  const tsStrictLibDependencies = await constructTypeScriptLibDependencies(
    tsVersion,
    useBrandedNumber,
    'global',
  );

  await fs.writeFile(
    outputFile,

    JSON.stringify({
      name,
      version: tsVersion,
      private: false,
      description: 'Strict TypeScript lib',
      repository: {
        type: 'git',
        url: repo,
      },
      license,
      author: 'noshiro-pf <noshiro.pf@gmail.com>',
      sideEffects: false,
      type: 'module',
      dependencies: {
        [typeUtilsName]: `^${tsTypeUtilsVersion}`,
        ...tsStrictLibDependencies,
      },
      peerDependencies: {
        typescript: '>=4.5.2',
      },
      publishConfig: {
        access: 'restricted',
        registry: 'https://npm.pkg.github.com/',
      },
    }),
  );

  console.log(`${outputFile} generated.`);

  return 'ok';
};

/** Construct `@typescript/lib-*` dependency object */
const constructTypeScriptLibDependencies = async (
  libVersion: string,
  useBrandedNumber: boolean,
  type: 'local' | 'global',
): Promise<Record<`@typescript/lib-${string}`, string>> => {
  const prefix = {
    local: `file:./packages/strict-ts-lib/output${useBrandedNumber ? '-branded' : ''}/packages/`,
    global: `npm:${libName}${useBrandedNumber ? '-branded' : ''}-`,
  }[type];

  const suffix = {
    local: '',
    global: `@${libVersion}`,
  }[type];

  const packagesDir = paths.strictTsLib.output.packages.$;

  const dirs = await fs.readdir(packagesDir);

  return Object.fromEntries(
    dirs.map((file) => [
      `@typescript/lib-${file}`,
      `${prefix}${file}${suffix}`,
    ]),
  );
};

const getStrictLibVersion = async (): Promise<string | undefined> => {
  // NOTE(noshiro-pf): import により静的に読み込むことも可能だが、
  // dist に package.json が複製され都合が悪いため動的に読み込む。

  const packageJsonStr = await fs.readFile(
    paths.strictTsLib.source.packageJson,
    { encoding: 'utf8' },
  );

  const packageJson = JSON.parse(packageJsonStr);

  return isRecord(packageJson) && Object.hasOwn(packageJson, 'version')
    ? typeof packageJson.version === 'string'
      ? packageJson.version
      : undefined
    : undefined;
};

const getTsTypeUtilsVersion = async (): Promise<string | undefined> => {
  // NOTE: import により静的に読み込むことも可能だが、
  // dist に package.json が複製され都合が悪いため動的に読み込む。

  const packageJsonStr = await fs.readFile(paths.tsTypeUtilsPackageJsonPath, {
    encoding: 'utf8',
  });

  const packageJson = JSON.parse(packageJsonStr);

  return isRecord(packageJson) && Object.hasOwn(packageJson, 'version')
    ? typeof packageJson.version === 'string'
      ? packageJson.version
      : undefined
    : undefined;
};
