import { fromMarkdown } from 'mdast-util-from-markdown';
import { proseBlocks } from './prose-blocks.mjs';

// No body found overflows the parser's stack in a test's time, so the parser is
// made to throw as it would.
vi.mock(import('mdast-util-from-markdown'), () => ({
  fromMarkdown: vi.fn(),
}));

test('reads a body too deep for the parser without it', () => {
  vi.mocked(fromMarkdown).mockImplementation(() => {
    throw new RangeError('Maximum call stack size exceeded');
  });

  assert.deepStrictEqual(proseBlocks('> Fixes #1\r\nCloses #2\n\nA'), [
    {
      text: '  Fixes #1 Closes #2',
      lines: [
        ...Array.from({ length: 11 }, () => 0),
        ...Array.from({ length: 9 }, () => 1),
      ],
    },
    { text: 'A', lines: [3] },
  ]);
});

test('throws any other error', () => {
  vi.mocked(fromMarkdown).mockImplementation(() => {
    throw new RangeError('Invalid array length');
  });

  assert.throws(() => proseBlocks('Fixes #1'), 'Invalid array length');
});
