import { Result } from 'ts-data-forge';
import {
  assertVariableNamesAreValid,
  RepositoryVariables,
} from './constants.mjs';

/** `'rejected'` when the names were refused, `'accepted'` when they were not. */
const outcomeOf = (variables: RepositoryVariables): string =>
  Result.isErr(
    Result.fromThrowable(() => {
      assertVariableNamesAreValid(variables);
    }),
  )
    ? 'rejected'
    : 'accepted';

describe('the repository-variables schema', () => {
  test('accepts a declaration of names to values', () => {
    const result = RepositoryVariables.validate({
      REPO_AUTOMATION_BOT_CLIENT_ID: 'Iv1example0client0id',
    });

    assert.isTrue(Result.isOk(result));

    if (Result.isOk(result)) {
      assert.deepStrictEqual(result.value, {
        REPO_AUTOMATION_BOT_CLIENT_ID: 'Iv1example0client0id',
      });
    }
  });

  test('accepts an empty declaration', () => {
    assert.isTrue(Result.isOk(RepositoryVariables.validate({})));
  });

  test('rejects a value that is not a string', () => {
    // A variable's value is always a string on GitHub's side. A number here
    // would be sent as one and read back as `"4476573"`, which reads as drift
    // on the next backup.
    assert.isTrue(
      Result.isErr(RepositoryVariables.validate({ A_NUMBER: 123 })),
    );

    assert.isTrue(Result.isErr(RepositoryVariables.validate({ A_NULL: null })));
  });

  test('rejects a declaration that is not a record', () => {
    assert.isTrue(Result.isErr(RepositoryVariables.validate([])));

    assert.isTrue(Result.isErr(RepositoryVariables.validate('')));

    assert.isTrue(Result.isErr(RepositoryVariables.validate(null)));
  });
});

describe(assertVariableNamesAreValid, () => {
  test('accepts the names GitHub accepts', () => {
    assert.deepStrictEqual(
      outcomeOf({
        REPO_AUTOMATION_BOT_CLIENT_ID: 'x',
        lowercase_is_allowed: 'x',
        _LEADING_UNDERSCORE: 'x',
        MIXED_Case_9: 'x',
      }),
      'accepted',
    );
  });

  test('rejects a name starting with a digit', () => {
    assert.deepStrictEqual(outcomeOf({ '1ST_PLACE': 'x' }), 'rejected');
  });

  test('rejects a name carrying a character GitHub does not allow', () => {
    assert.deepStrictEqual(outcomeOf({ 'WITH-HYPHEN': 'x' }), 'rejected');

    assert.deepStrictEqual(outcomeOf({ 'WITH SPACE': 'x' }), 'rejected');

    assert.deepStrictEqual(outcomeOf({ 'WITH.DOT': 'x' }), 'rejected');
  });

  test('rejects the reserved GITHUB_ prefix, in any case', () => {
    assert.deepStrictEqual(outcomeOf({ GITHUB_TOKEN: 'x' }), 'rejected');

    assert.deepStrictEqual(outcomeOf({ github_token: 'x' }), 'rejected');
  });

  test('rejects an empty name', () => {
    assert.deepStrictEqual(outcomeOf({ '': 'x' }), 'rejected');
  });

  test('names every offender, so one run fixes the file', () => {
    const result = Result.fromThrowable(() => {
      assertVariableNamesAreValid({
        'WITH-HYPHEN': 'x',
        GITHUB_TOKEN: 'x',
        FINE: 'x',
      });
    });

    assert.isTrue(Result.isErr(result));

    if (!Result.isErr(result)) {
      return;
    }

    assert.isTrue(result.value.message.includes('WITH-HYPHEN'));

    assert.isTrue(result.value.message.includes('GITHUB_TOKEN'));

    assert.isFalse(result.value.message.includes('FINE'));
  });
});
