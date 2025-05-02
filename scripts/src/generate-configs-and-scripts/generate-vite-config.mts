import 'zx/globals';
import {
  tsconfigTestJsonName,
  viteConfigName,
  workspaceConfigsDirName,
} from './constants.mjs';
import { workspaceConfig } from './workspace-config.mjs';
import { writeDirAndFileAndPrintDone } from './write-dir-and-file-and-print-done.mjs';

export const generateViteConfig = async (
  workspaceLocation: string,
  packageName: string,
): Promise<void> => {
  const cfg = workspaceConfig[packageName];

  if (cfg === undefined) {
    throw new Error(`workspaceConfig for package "${packageName}" not found.`);
  }

  if (!cfg.gen.build) return;

  const content = [
    packageName === 'my-portfolio-app-preact'
      ? `import mdx from '@mdx-js/rollup';`
      : '',

    cfg.tsType === 'react-emotion' || cfg.tsType === 'react'
      ? `import react from '@vitejs/plugin-react-swc';`
      : cfg.tsType === 'preact'
        ? `import preact from '@preact/preset-vite';`
        : '',
    `import legacy from '@vitejs/plugin-legacy';`,
    `import * as path from 'node:path';`,
    `import { defineConfig, PluginOption } from 'vite';`,
    "import { type UserConfig } from 'vitest/node';",
    `import { createInjectDef } from './inject-def';`,
    ``,
    `const thisDir: string = import.meta.dirname;`,
    ``,
    `// https://vitejs.dev/config/`,
    `export default defineConfig(async () => {`,
    `  const injectDef = await createInjectDef();`,
    ``,
    `  return {`,
    `    plugins: [
      ${
        packageName === 'my-portfolio-app-preact'
          ? `mdx({ jsxImportSource: 'preact' }) as PluginOption,`
          : ''
      }
      ${
        cfg.tsType === 'react-emotion'
          ? `react({ jsxImportSource: '@emotion/react' }), `
          : cfg.tsType === 'react'
            ? `react(), `
            : cfg.tsType === 'preact'
              ? `preact(), `
              : ''
      }injectDef, legacy()],`,
    `    build: {`,
    `      outDir: 'build',`,
    `    },`,
    `    resolve: {`,
    `      alias: [`,
    `        { find: '~', replacement: path.resolve(thisDir, '../', 'src') },`,
    `      ],`,
    `    },`,
    `    test: {`,
    `      include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],`,
    `      globals: true,`,
    `      environment: 'happy-dom',`,
    `      typecheck: {`,
    `        tsconfig: path.resolve(thisDir, '${tsconfigTestJsonName}'),`,
    `      },`,
    `    } satisfies UserConfig,`,
    `  };`,
    `});`,
  ].join('\n');

  await writeDirAndFileAndPrintDone(
    path.resolve(workspaceLocation, workspaceConfigsDirName),
    viteConfigName,
    content,
    packageName,
  );
};
