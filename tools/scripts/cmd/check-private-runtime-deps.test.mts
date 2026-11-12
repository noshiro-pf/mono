import dedent from 'dedent';
import {
  findDevOnlyRuntimeImports,
  isRuntimeSource,
  runtimeImportsOf,
} from './check-private-runtime-deps.mjs';

describe(isRuntimeSource, () => {
  test('takes the modules under src/ that run in the app', () => {
    const src = 'apps/x/src/';

    assert.isTrue(isRuntimeSource('apps/x/src/app.tsx', src));

    assert.isTrue(isRuntimeSource('apps/x/src/lib/util.mts', src));

    assert.isFalse(isRuntimeSource('apps/x/src/app.test.tsx', src));

    assert.isFalse(isRuntimeSource('apps/x/src/run.bench-browser.mts', src));

    assert.isFalse(isRuntimeSource('apps/x/src/run.bench.mts', src));

    assert.isFalse(isRuntimeSource('apps/x/src/types.d.mts', src));

    assert.isFalse(isRuntimeSource('apps/x/src/app.module.d.css.ts', src));

    assert.isFalse(isRuntimeSource('apps/x/src/app.module.css', src));

    assert.isFalse(isRuntimeSource('apps/x/test/app.tsx', src));
  });
});

describe(runtimeImportsOf, () => {
  test('reads the packages a module needs at run time, by name', () => {
    assert.deepStrictEqual(
      runtimeImportsOf(
        'src/app.tsx',
        dedent`
          import { createState } from 'synstate';
          import * as Arr from 'ts-data-forge/array';
          import { Button } from '@blueprintjs/core/lib/esm';
          import '@fontsource/roboto';
          import styles from './app.module.css';
          import * as fs from 'node:fs';
          import path from 'path';
          import { getCollection } from 'astro:content';
          import raw from 'some-text/file.txt?raw';
          export { render } from 'synstate-dom';
          const lazy = await import('firebase/app');
        `,
      ),
      [
        'synstate',
        'ts-data-forge',
        '@blueprintjs/core',
        '@fontsource/roboto',
        'some-text',
        'synstate-dom',
        'firebase',
      ],
    );
  });

  test('leaves out what only types need', () => {
    assert.deepStrictEqual(
      runtimeImportsOf(
        'src/types.mts',
        dedent`
          import type { JSX } from 'react';
          import { type Observable, type Subscription } from 'synstate';
          export type { Router } from 'synstate-router';
          export { type Optional } from 'ts-data-forge';
          import { type A, b } from 'mixed';
        `,
      ),
      ['mixed'],
    );
  });
});

describe(findDevOnlyRuntimeImports, () => {
  test('names a runtime import of a package listed only in devDependencies', () => {
    assert.deepStrictEqual(
      findDevOnlyRuntimeImports({
        manifest: {
          name: 'some-app',
          private: true,
          dependencies: { synstate: 'workspace:*' },
          devDependencies: { react: 'catalog:', vitest: 'catalog:' },
        },
        files: [
          {
            path: 'src/app.tsx',
            text: "import { useState } from 'react';\nimport { createState } from 'synstate';\n",
          },
          {
            path: 'src/b.tsx',
            text: "import { createElement } from 'react';\n",
          },
        ],
      }),
      [{ name: 'react', files: ['src/app.tsx', 'src/b.tsx'] }],
    );
  });

  test('accepts a package in peerDependencies or optionalDependencies too', () => {
    assert.deepStrictEqual(
      findDevOnlyRuntimeImports({
        manifest: {
          name: 'react-utils',
          private: true,
          peerDependencies: { react: '>=19' },
          optionalDependencies: { 'fsevents-like': '1' },
          devDependencies: { react: 'catalog:', 'fsevents-like': '1' },
        },
        files: [
          {
            path: 'src/index.mts',
            text: "import { useState } from 'react';\nimport x from 'fsevents-like';\n",
          },
        ],
      }),
      [],
    );
  });

  test('leaves alone an import the manifest does not declare at all, which the lint rule reports', () => {
    assert.deepStrictEqual(
      findDevOnlyRuntimeImports({
        manifest: { name: 'some-app', private: true },
        files: [{ path: 'src/app.mts', text: "import x from 'nowhere';\n" }],
      }),
      [],
    );
  });

  test('counts the JSX runtime a .tsx module imports without writing it', () => {
    assert.deepStrictEqual(
      findDevOnlyRuntimeImports({
        manifest: {
          name: 'docs',
          private: true,
          devDependencies: { 'synstate-dom': 'workspace:*', preact: '10' },
        },
        jsxImportSource: 'synstate-dom',
        files: [
          { path: 'src/demo.tsx', text: 'export const Demo = () => <p />;\n' },
          {
            path: 'src/other.tsx',
            text: '/** @jsxImportSource preact */\nexport const Other = () => <p />;\n',
          },
          { path: 'src/data.mts', text: 'export const n = 1;\n' },
        ],
      }),
      [
        { name: 'synstate-dom', files: ['src/demo.tsx'] },
        { name: 'preact', files: ['src/other.tsx'] },
      ],
    );
  });

  test('leaves alone a type-only import of a devDependency', () => {
    assert.deepStrictEqual(
      findDevOnlyRuntimeImports({
        manifest: {
          name: 'some-app',
          private: true,
          devDependencies: { 'ts-type-forge': 'workspace:*' },
        },
        files: [
          {
            path: 'src/app.mts',
            text: "import type { DeepReadonly } from 'ts-type-forge';\n",
          },
        ],
      }),
      [],
    );
  });
});
