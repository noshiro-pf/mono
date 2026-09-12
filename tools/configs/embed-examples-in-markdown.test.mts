import { Result } from 'ts-data-forge';
import {
  countSampleBackedFences,
  embedSamplesIntoMarkdown,
} from './embed-examples-in-markdown.mjs';

/**
 * The fixtures are written as arrays of lines rather than as `dedent`
 * literals, as in `embed-examples-utils.test.mts`: the indentation of a fence
 * nested in a list item is part of what is being tested, and `dedent` exists
 * to remove it.
 */
describe('countSampleBackedFences', () => {
  test('counts every spelling of JavaScript and TypeScript', () => {
    const markdown = [
      '```ts',
      '```',
      '```typescript',
      '```',
      '```javascript',
      '```',
      '```cjs',
      '```',
    ].join('\n');

    assert.deepStrictEqual(countSampleBackedFences(markdown), 4);
  });

  test('counts a fence nested in a list item', () => {
    const markdown = [
      '- item',
      '',
      '    ```ts',
      '    const a = 1;',
      '    ```',
    ].join('\n');

    assert.deepStrictEqual(countSampleBackedFences(markdown), 1);
  });

  test('ignores other languages and tags that only start like a language', () => {
    const markdown = [
      '```bash',
      '```',
      '```json',
      '```',
      '```ts-ignore',
      '```',
    ].join('\n');

    assert.deepStrictEqual(countSampleBackedFences(markdown), 0);
  });
});

describe('embedSamplesIntoMarkdown', () => {
  test('replaces the fence bodies in order', () => {
    const markdown = [
      '# Title',
      '',
      '```ts',
      'old one',
      '```',
      '',
      '```bash',
      'npm i',
      '```',
      '',
      '```typescript',
      'old two',
      '```',
      '',
    ].join('\n');

    const result = embedSamplesIntoMarkdown(markdown, [
      { name: 'a.mts', code: 'const a = 1;' },
      { name: 'b.mts', code: 'const b = 2;' },
    ]);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(
      result.value,
      [
        '# Title',
        '',
        '```ts',
        'const a = 1;',
        '```',
        '',
        '```bash',
        'npm i',
        '```',
        '',
        '```typescript',
        'const b = 2;',
        '```',
        '',
      ].join('\n'),
    );
  });

  test('indents a sample to the column of a nested fence', () => {
    const markdown = [
      '- item',
      '',
      '    ```ts',
      '    old',
      '    ```',
      '',
      'after',
    ].join('\n');

    const result = embedSamplesIntoMarkdown(markdown, [
      {
        name: 'a.mts',
        code: ['if (x) {', '  y();', '', '  z();', '}'].join('\n'),
      },
    ]);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(
      result.value,
      [
        '- item',
        '',
        '    ```ts',
        '    if (x) {',
        '      y();',
        '',
        '      z();',
        '    }',
        '    ```',
        '',
        'after',
      ].join('\n'),
    );
  });

  test('fails when a fence has no sample', () => {
    const markdown = ['```ts', '```', '```typescript', '```'].join('\n');

    const result = embedSamplesIntoMarkdown(markdown, [
      { name: 'a.mts', code: '' },
    ]);

    assert.isTrue(Result.isErr(result));
  });
});
