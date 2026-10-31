import dedent from 'dedent';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import {
  isIdentifier,
  isVariableDeclaration,
} from 'typescript-native/unstable/ast';
import { runRules, wrapperLayers, type Rule } from '../src/index.mjs';

/**
 * Reports the initializer of every `const probe… = …`, with the text of each of
 * its {@link wrapperLayers} joined by ` | `.
 */
const layersProbe: Rule = {
  ruleId: 'test/wrapper-layers',
  description: 'Reports the wrapper layers of each probe initializer.',
  messages: { layers: '{{layers}}' },
  visit: (node, { report, sourceFile }) => {
    if (
      !isVariableDeclaration(node) ||
      !isIdentifier(node.name) ||
      !node.name.text.startsWith('probe') ||
      node.initializer === undefined
    ) {
      return;
    }

    report(node.initializer, 'layers', {
      layers: wrapperLayers(node.initializer)
        .map((layer) => layer.getText(sourceFile))
        .join(' | '),
    });
  },
} as const;

const layersOf = (code: string): readonly string[] => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sumi-wrapper-layers-'));

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(
    path.join(dir, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        module: 'nodenext',
        moduleResolution: 'nodenext',
        target: 'esnext',
        noEmit: true,
        types: [],
        lib: ['esnext'],
      },
      include: ['*.mts'],
    }),
  );

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(path.join(dir, 'probe.mts'), `${code.trim()}\n`);

  const result = runRules(path.join(dir, 'tsconfig.json'), [layersProbe]);

  assert.isTrue(Result.isOk(result));

  return (Result.isOk(result) ? result.value : []).map(
    (diagnostic) => diagnostic.message,
  );
};

describe(wrapperLayers, () => {
  test('every wrapper and parenthesis, outermost first', () => {
    assert.deepStrictEqual(
      layersOf(dedent`
        declare const x: string | undefined;

        export const probePlain = x;
        export const probeAs = x as unknown as number;
        export const probeMixed = (<string>x!) satisfies string;
      `),
      [
        'x',
        'x as unknown as number | x as unknown | x',
        '(<string>x!) satisfies string | (<string>x!) | <string>x! | x! | x',
      ],
    );
  });
});
