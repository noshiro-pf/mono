import dedent from 'dedent';
import * as tsm from 'ts-morph';
import { replaceNodeWithText } from './replace-node-with-text.mjs';

/**
 * Replaces the first type reference named `target` in `source`, once with
 * `replaceNodeWithText` and once with ts-morph's own `replaceWithText`.
 */
const replaceBothWays = (
  source: string,
  target: string,
  newNodeText: string,
): Readonly<{ actual: string; expected: string; replacedKind: string }> => {
  const replace = (
    fn: (nodeToReplace: tsm.Node, text: string) => tsm.Node,
  ): Readonly<{ text: string; replacedKind: string }> => {
    const project = new tsm.Project({ useInMemoryFileSystem: true });

    const sourceFile = project.createSourceFile('source.ts', source);

    const node = sourceFile
      .getDescendantsOfKind(tsm.SyntaxKind.TypeReference)
      .find((n) => n.getText() === target);

    assert.isDefined(node);

    const replaced = fn(node, newNodeText);

    return {
      text: sourceFile.getFullText(),
      replacedKind: replaced.getKindName(),
    };
  };

  const actual = replace(replaceNodeWithText);

  const expected = replace((node, text) => node.replaceWithText(text));

  assert.strictEqual(actual.replacedKind, expected.replacedKind);

  return {
    actual: actual.text,
    expected: expected.text,
    replacedKind: actual.replacedKind,
  };
};

const indentedSource = dedent`
  namespace A {
    namespace B {
      export type C = {
        readonly d: Foo;
      };
    }
  }
`;

describe(replaceNodeWithText, () => {
  test.each([
    { name: 'a one-line text', newNodeText: 'readonly number[]' },
    { name: 'an empty text', newNodeText: '' },
    { name: 'a text with a lone CR', newNodeText: 'Bar\r' },
    { name: 'a text with a trailing space', newNodeText: 'Bar ' },
    { name: 'a text with a string literal', newNodeText: '\'a\' | "b"' },
    { name: 'a text with a line comment', newNodeText: 'Bar /* c */' },
    { name: 'a multi-line text', newNodeText: '{\n  a: number;\n}' },
    { name: 'a CRLF text', newNodeText: '{\r\n  a: number;\r\n}' },
  ])('writes the text replaceWithText writes: $name', ({ newNodeText }) => {
    const { actual, expected } = replaceBothWays(
      indentedSource,
      'Foo',
      newNodeText,
    );

    expect(actual).toBe(expected);
  });

  test('returns the node that took the place of the replaced one', () => {
    const { actual, replacedKind } = replaceBothWays(
      indentedSource,
      'Foo',
      'Readonly<Bar>',
    );

    expect(replacedKind).toBe('TypeReference');

    expect(actual).toContain('readonly d: Readonly<Bar>;');
  });
});
