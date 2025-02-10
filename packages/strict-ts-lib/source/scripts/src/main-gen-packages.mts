import { isRecord, toThisDir } from '@noshiro/mono-utils';
import 'zx/globals';
import { getSrcFileList, type ConverterConfig } from './convert-dts/common.mjs';
import {
  configs,
  libName,
  license,
  repo,
  typeUtilsName,
} from './convert-dts/constants.mjs';
import { convert } from './convert-dts/convert-main.mjs';

const thisDir = toThisDir(import.meta.url);

const strictTsLibDir = path.resolve(thisDir, '../../..');

const tsTypeUtilsDir = path.resolve(
  strictTsLibDir,
  '../ts-type-utils/package.json',
);

const sourcePackageJsonDir = path.resolve(
  strictTsLibDir,
  'source/package.json',
);

const srcDir = path.resolve(strictTsLibDir, 'source/temp/eslint-fixed');

const srcFileList = await getSrcFileList(srcDir);

const main = async (): Promise<void> => {
  const configs2 = configs.map((c) => ({ ...c, forNpmPackage: true }));

  await Promise.all([
    ...configs2.map(createPackages),
    ...configs2.map(createLib),
  ]);
};

const getTypeScriptVersion = async (): Promise<string | undefined> => {
  const typescriptVersion = await fs
    .readFile('./scripts/typescript-version.txt', 'utf8')
    .then((s) => s.replace('\n', ''));

  if (!/[0-9].[0-9].[0-9]/gu.test(typescriptVersion)) return undefined;

  return typescriptVersion;
};

const getVersion = async (): Promise<string | undefined> => {
  // NOTE(noshiro-pf): import により静的に読み込むことも可能だが、
  // dist に package.json が複製され都合が悪いため動的に読み込む。

  const packageJsonStr = await fs.readFile(sourcePackageJsonDir, {
    encoding: 'utf8',
  });

  const packageJson = JSON.parse(packageJsonStr);

  return isRecord(packageJson) && Object.hasOwn(packageJson, 'version')
    ? typeof packageJson.version === 'string'
      ? packageJson.version
      : undefined
    : undefined;
};

const getTsTypeUtilsVersion = async (): Promise<string | undefined> => {
  // NOTE(noshiro-pf): import により静的に読み込むことも可能だが、
  // dist に package.json が複製され都合が悪いため動的に読み込む。

  const packageJsonStr = await fs.readFile(tsTypeUtilsDir, {
    encoding: 'utf8',
  });

  const packageJson = JSON.parse(packageJsonStr);

  return isRecord(packageJson) && Object.hasOwn(packageJson, 'version')
    ? typeof packageJson.version === 'string'
      ? packageJson.version
      : undefined
    : undefined;
};

const createLib = async (config: ConverterConfig): Promise<void> => {
  const version = await getVersion();
  const tsTypeUtilsVersion = await getTsTypeUtilsVersion();

  if (version === undefined) {
    throw new Error('version is undefined');
  }

  if (tsTypeUtilsVersion === undefined) {
    throw new Error('tsTypeUtilsVersion is undefined');
  }

  const outDir = path.resolve(
    strictTsLibDir,
    `output${config.useBrandedNumber ? '-branded' : ''}/lib`,
  );

  try {
    await fs.access(outDir);
  } catch {
    await fs.mkdir(outDir, { recursive: true });
  }

  {
    const outputFile = `${outDir}/package.json`;

    const prefix = config.useLocalPath
      ? 'file:../packages/'
      : `npm:${libName}${config.useBrandedNumber ? '-branded' : ''}-`;

    const suffix = config.useLocalPath ? '' : `@${version}`;

    await fs.writeFile(
      outputFile,

      JSON.stringify({
        name: `${libName}${config.useBrandedNumber ? '-branded' : ''}`,
        version,
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
          '@typescript/lib-decorators': `${prefix}decorators${suffix}`,
          '@typescript/lib-dom': `${prefix}dom${suffix}`,
          '@typescript/lib-es2015': `${prefix}es2015${suffix}`,
          '@typescript/lib-es2016': `${prefix}es2016${suffix}`,
          '@typescript/lib-es2017': `${prefix}es2017${suffix}`,
          '@typescript/lib-es2018': `${prefix}es2018${suffix}`,
          '@typescript/lib-es2019': `${prefix}es2019${suffix}`,
          '@typescript/lib-es2020': `${prefix}es2020${suffix}`,
          '@typescript/lib-es2021': `${prefix}es2021${suffix}`,
          '@typescript/lib-es2022': `${prefix}es2022${suffix}`,
          '@typescript/lib-es2023': `${prefix}es2023${suffix}`,
          '@typescript/lib-es5': `${prefix}es5${suffix}`,
          '@typescript/lib-es6': `${prefix}es6${suffix}`,
          '@typescript/lib-esnext': `${prefix}esnext${suffix}`,
          '@typescript/lib-scripthost': `${prefix}scripthost${suffix}`,
          '@typescript/lib-webworker': `${prefix}webworker${suffix}`,
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
  }
};

const createPackages = async (config: ConverterConfig): Promise<void> => {
  const version = await getVersion();

  if (version === undefined) {
    throw new Error('version is undefined');
  }

  const outDir = path.resolve(
    strictTsLibDir,
    `output${config.useBrandedNumber ? '-branded' : ''}/packages`,
  );

  const typescriptVersion = await getTypeScriptVersion();

  if (typescriptVersion === undefined) {
    throw new Error('typescriptVersion is undefined');
  }

  if (!version.startsWith(typescriptVersion)) {
    throw new Error(
      `version should starts with typescriptVersion "${typescriptVersion}"`,
    );
  }

  const results = srcFileList.map(
    ({ content, filename }) =>
      [convert(filename, config)(content), filename] as const,
  );

  await Promise.all(
    results.map(async ([result, filename]) => {
      if (filename === 'lib.d.ts') return;

      // eslint-disable-next-line no-restricted-syntax
      const suffix = filename
        .replaceAll('lib.', '')
        .replaceAll('.d.ts', '')
        .split('.');

      const outputDir = `${outDir}/${suffix.join('/')}`;

      try {
        await fs.access(outputDir);
      } catch {
        await fs.mkdir(outputDir, { recursive: true });
      }

      {
        const outputFile = `${outputDir}/index.d.ts`;

        await fs.writeFile(outputFile, result);

        console.log(`${outputFile} generated.`);
      }

      {
        const tsTypeUtilsVersion = await getTsTypeUtilsVersion();

        const outputFile = `${outputDir}/package.json`;

        await fs.writeFile(
          outputFile,
          JSON.stringify({
            name: `${libName}${config.useBrandedNumber ? '-branded' : ''}-${suffix.join('-')}`,
            version,
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
};

await main();
