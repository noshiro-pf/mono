import dedent from 'dedent';
import * as tsm from 'ts-morph';
import {
  ensureTsTypeForgeTypeImport,
  typeNameScope,
  typeNameUse,
} from './ensure-ts-type-forge-type-import.mjs';

const sourceFileOf = (text: string): tsm.SourceFile => {
  const project = new tsm.Project({ useInMemoryFileSystem: true });

  return project.createSourceFile('source.mts', text);
};

const withImport = (text: string): string => {
  const sourceFile = sourceFileOf(text);

  ensureTsTypeForgeTypeImport(sourceFile, 'UnknownRecord');

  return sourceFile.getFullText();
};

describe(ensureTsTypeForgeTypeImport, () => {
  test('merges into an import type of the module before a value import', () => {
    expect(
      withImport(dedent`
        import { expectType } from 'ts-type-forge';
        import type { DeepReadonly } from 'ts-type-forge';
        export type A = DeepReadonly<{}>;
      `),
    ).toContain(
      "import type { DeepReadonly, UnknownRecord } from 'ts-type-forge';",
    );
  });

  test('adds a declaration beside a namespace import, which cannot take a name', () => {
    const output = withImport(dedent`
      import type * as tf from 'ts-type-forge';
      export type A = tf.DeepReadonly<{}>;
    `);

    expect(output).toContain("import type * as tf from 'ts-type-forge';");

    expect(output).toContain(
      "import type { UnknownRecord } from 'ts-type-forge';",
    );
  });

  test('does nothing when an import of the module already binds the name', () => {
    const text = dedent`
      import type { UnknownRecord } from 'ts-type-forge';
      export type A = UnknownRecord;
    `;

    expect(withImport(text)).toBe(text);
  });

  test('writes the line breaks of a CRLF file', () => {
    expect(
      withImport("import { a } from './a.mjs';\r\nexport const b = a;\r\n"),
    ).not.toMatch(/(?<!\r)\n/u);
  });

  test('takes the quotes of the last import', () => {
    expect(
      withImport('import { a } from "./a.mjs";\nexport const b = a;\n'),
    ).toContain('import type { UnknownRecord } from "ts-type-forge";');
  });

  test('goes after the directive prologue, with its quotes', () => {
    expect(withImport('"use client";\n\nexport const b = 1;\n')).toMatch(
      /^"use client";\nimport type \{ UnknownRecord \} from "ts-type-forge";/u,
    );
  });

  test('keeps a shebang on the first line', () => {
    expect(withImport('#!/usr/bin/env node\nexport const b = 1;\n')).toMatch(
      /^#!\/usr\/bin\/env node\nimport type \{ UnknownRecord \}/u,
    );
  });
});

describe(typeNameScope, () => {
  test.each([
    ['export const a = 1;', 'free'],
    ["import type { UnknownRecord } from './types.mjs';", 'in-scope'],
    ['type UnknownRecord = object;', 'in-scope'],
    ['export type A = UnknownRecord;', 'in-scope'],
    ['export const UnknownRecord = 1;', 'taken'],
    ['namespace UnknownRecord {}', 'taken'],
    ['function f() { type UnknownRecord = object; }', 'free'],
  ] as const)('reads %j as %s', (text, expected) => {
    expect(
      typeNameScope(sourceFileOf(text).compilerNode, 'UnknownRecord'),
    ).toBe(expected);
  });
});

describe(typeNameUse, () => {
  test.each([
    ['export const a = 1;', 'import'],
    ['const a = 1;', 'leave'],
    ['interface Window { x: UnknownRecord }', 'write'],
    ['export const UnknownRecord = 1;', 'leave'],
  ] as const)('gives %j %s', (text, expected) => {
    expect(typeNameUse(sourceFileOf(text).compilerNode, 'UnknownRecord')).toBe(
      expected,
    );
  });
});
