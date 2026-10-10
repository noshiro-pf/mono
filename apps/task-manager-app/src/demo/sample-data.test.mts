import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { DomainStateCodec } from '../domain/index.mjs';
import { sampleState } from './sample-data.mjs';

describe(sampleState, () => {
  test('is a valid domain state', () => {
    const result = DomainStateCodec.validate(sampleState(1_760_000_000_000));

    assert.deepStrictEqual(
      Result.isErr(result) ? t.validationErrorsToMessages(result.value) : [],
      [],
    );
  });

  test('has no fields the domain does not know', () => {
    const state = sampleState(0);

    assert.deepStrictEqual(DomainStateCodec.prune(state), state);
  });
});
