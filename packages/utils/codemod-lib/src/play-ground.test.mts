import { codeFromStringLines, testFn } from './index.mjs';

describe('playground', () => {
  const source = codeFromStringLines(
    'function foo() {',
    '  return [1, 2, 3] as const;',
    '}',
    '',
    '',
    '',
    'function foo() {',
    '  let foo: {',
    '    a: number,',
    '    b: ReadonlyArray<string>,',
    '    c: () => string,',
    '    d: { [key: string]: string[] },',
    '    [key: string]: string[],',
    '    readonly d: {',
    '      a: number,',
    '      b: ReadonlyArray<string>,',
    '      c: () => string,',
    '      d: { [key: string]: string[] },',
    '      [key: string]: string[],',
    '    }',
    '  }',
    '};',
  );

  testFn(
    (sourceFile) => {
      let mut_i = 0;
      sourceFile.forEachChild((child) => {
        console.debug(mut_i, child.getText());
        mut_i += 1;
      });
    },
    source,
    source,
    false,
  ).catch(() => {});
});
