import * as tsm from 'ts-morph';
import { hasDisableNextLineComment } from './has-disable-next-line-comment.mjs';

/** The first type alias in `source`, the node every case asks about. */
const typeAliasOf = (source: string): tsm.TypeAliasDeclaration => {
  const project = new tsm.Project({ useInMemoryFileSystem: true });

  return project
    .createSourceFile('source.ts', source)
    .getFirstDescendantByKindOrThrow(tsm.SyntaxKind.TypeAliasDeclaration);
};

describe(hasDisableNextLineComment, () => {
  test.each([
    {
      name: 'a comment on the line above (LF)',
      source: '// transformer-ignore-next-line\ntype A = number[];\n',
      expected: true,
    },
    {
      name: 'a comment on the line above (CRLF)',
      source: '// transformer-ignore-next-line\r\ntype A = number[];\r\n',
      expected: true,
    },
    {
      name: 'a comment two lines above',
      source: '// transformer-ignore-next-line\n\ntype A = number[];\n',
      expected: false,
    },
    {
      name: 'a comment two lines above (CRLF)',
      source: '// transformer-ignore-next-line\r\n\r\ntype A = number[];\r\n',
      expected: false,
    },
    {
      name: 'a later comment on the line above shadows an earlier ignore comment',
      source:
        '// transformer-ignore-next-line\n// something else\ntype A = number[];\n',
      expected: false,
    },
    {
      name: 'the node on the first line',
      source: 'type A = number[];\n',
      expected: false,
    },
    {
      name: 'the node on the first line after a block comment',
      source: '/* transformer-ignore-next-line */ type A = number[];\n',
      expected: false,
    },
    {
      name: 'a lone CR, which does not count as a line break',
      source: '// transformer-ignore-next-line\rtype A = number[];\n',
      expected: false,
    },
    {
      name: 'a lone CR before the comment, deep in the file',
      source:
        'const x = 1;\r\nconst y = 2;\r// transformer-ignore-next-line\ntype A = number[];\n',
      expected: true,
    },
    {
      name: 'a node far below many lines',
      source: `${'const x = 1;\n'.repeat(500)}// transformer-ignore-next-line\ntype A = number[];\n`,
      expected: true,
    },
  ])('$name', ({ source, expected }) => {
    expect(hasDisableNextLineComment(typeAliasOf(source))).toBe(expected);
  });

  test('matches the transformer name list', () => {
    const node = typeAliasOf(
      '// transformer-ignore-next-line append-as-const, convert-to-readonly\ntype A = number[];\n',
    );

    assert.isTrue(hasDisableNextLineComment(node, 'convert-to-readonly'));

    assert.isFalse(hasDisableNextLineComment(node, 'replace-any-with-unknown'));
  });

  test('reads the current text after the file has been edited', () => {
    const node = typeAliasOf('type A = number[];\n');

    assert.isFalse(hasDisableNextLineComment(node));

    const sourceFile = node.getSourceFile();

    sourceFile.insertText(0, '// transformer-ignore-next-line\n');

    const edited = sourceFile.getFirstDescendantByKindOrThrow(
      tsm.SyntaxKind.TypeAliasDeclaration,
    );

    assert.isTrue(hasDisableNextLineComment(edited));
  });
});
