import { Result } from 'ts-data-forge';
import { lastLines, shell, shellQuote, withCaptures } from './shell.mjs';

describe(withCaptures, () => {
  test('puts each capture group in, quoted', () => {
    assert.strictEqual(
      withCaptures('pnpm run fix:$1 -- $2', ['whole', 'lint', "it's"] as const),
      String.raw`pnpm run fix:'lint' -- 'it'\''s'`,
    );
  });
});

describe(shellQuote, () => {
  test('is read back as the value by a shell', async () => {
    const value = ["a 'b'", '"c" $d `e`'].join(' ');

    assert.deepStrictEqual(
      await shell(process.cwd(), `printf %s ${shellQuote(value)}`),
      Result.ok(value),
    );
  });
});

describe(shell, () => {
  test('fails with what the command printed', async () => {
    const ran = await shell(process.cwd(), 'echo out; echo err >&2; exit 3');

    assert.deepStrictEqual(ran, Result.err('out\nerr'));
  });
});

describe(lastLines, () => {
  test('keeps the last lines', () => {
    assert.strictEqual(lastLines('a\nb\nc', 2), 'b\nc');
  });
});
