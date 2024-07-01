import * as fs from 'node:fs/promises';
import { getSrcFileList, type ConverterConfig } from './convert-dts/common.mjs';
import { convert } from './convert-dts/convert-main.mjs';

const createPackages = async (config: ConverterConfig): Promise<void> => {
  const srcDir = './temp/eslint-fixed';

  const srcFileList = await getSrcFileList(srcDir);

  const distDir = `../${config.useBrandedNumber ? 'branded/packages' : 'basic/packages'}`;

  const typescriptVersion = await fs
    .readFile('./scripts/typescript-version.txt', 'utf8')
    .then((s) => s.replace('\n', ''));

  if (!/[0-9].[0-9].[0-9]/gu.test(typescriptVersion)) return;

  await Promise.all(
    srcFileList.map(async ({ content, filename }) => {
      if (filename === 'lib.d.ts') return;

      // eslint-disable-next-line no-restricted-syntax
      const suffix = filename
        .replaceAll('lib.', 'lib-')
        .replaceAll('.d.ts', '')
        .split('.');

      const outputDir = `${distDir}/${suffix.join('/')}`;

      try {
        await fs.access(outputDir);
      } catch {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.mkdir(outputDir, { recursive: true });
      }

      {
        const outputFile = `${outputDir}/index.d.ts`;

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.writeFile(outputFile, convert(filename, config)(content));

        console.log(`${outputFile} generated.`);
      }

      {
        const outputFile = `${outputDir}/package.json`;

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.writeFile(
          outputFile,
          // eslint-disable-next-line no-restricted-globals
          JSON.stringify({
            name: `@noshiro/strict-typescript${config.useBrandedNumber ? '-branded' : ''}-${suffix.join('-')}`,
            version: typescriptVersion,
            private: false,
            description: 'Strict TypeScript lib',
            repository: {
              type: 'git',
              url: 'https://github.com/noshiro-pf/mono.git',
            },
            license: 'MIT',
            author: 'noshiro-pf <noshiro.pf@gmail.com>',
            sideEffects: false,
            type: 'module',
            types: './index.d.ts',
            dependencies: {
              '@noshiro/ts-type-utils-no-stdlib': '*',
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

await createPackages({
  useBrandedNumber: false,
  commentOutDeprecated: false,
  returnType: 'mutable',
  forNpmPackage: true,
});

await createPackages({
  useBrandedNumber: true,
  commentOutDeprecated: false,
  returnType: 'readonly',
  forNpmPackage: true,
});
