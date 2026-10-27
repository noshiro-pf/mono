import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { parseJson } from './json.mjs';

describe(parseJson, () => {
  const Schema = t.record({ number: t.number() });

  test('answers the value when the text is JSON of the shape', () => {
    assert.deepStrictEqual(
      parseJson('{"number":1}', Schema, 'gh pr view 1'),
      Result.ok({ number: 1 }),
    );
  });

  test('names the source when the text is not JSON', () => {
    const parsed = parseJson('not json', Schema, 'gh pr view 1');

    assert.isTrue(Result.isErr(parsed));

    assert.isTrue(parsed.value.startsWith('gh pr view 1 is not valid JSON: '));
  });

  test('names the source and the field when the shape is wrong', () => {
    const parsed = parseJson('{"number":"1"}', Schema, 'gh pr view 1');

    assert.isTrue(Result.isErr(parsed));

    assert.isTrue(
      parsed.value.startsWith('gh pr view 1 has an unexpected shape:\n'),
    );

    assert.include(parsed.value, 'number');
  });
});
