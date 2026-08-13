import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Obj, Result } from 'ts-data-forge';
import { validationErrorsToMessages } from 'ts-fortress';
import { RulesetPicked, rulesetKeysToPick } from './constants.mjs';

/**
 * The rulesets this repository declares, read from where `repo-settings apply`
 * reads them.
 *
 * The real files rather than copies of them: what is worth knowing is that the
 * payloads actually committed here parse. `apply` throws outright when one does
 * not, and by then it is running against GitHub.
 */
const rulesetsDir = path.resolve(
  import.meta.dirname,
  '../../../../../repo-settings/rulesets',
);

const readJsonFilesIn = async (
  dir: string,
): Promise<readonly (readonly [string, unknown])[]> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const entries = await fs.readdir(dir, { withFileTypes: true });

  return Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map(async (entry) => {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const content = await fs.readFile(
          path.resolve(dir, entry.name),
          'utf8',
        );

        return [entry.name, JSON.parse(content)] as const;
      }),
  );
};

/**
 * The file name on success, and the name with what went wrong on failure.
 *
 * Compared against the bare name rather than asserted on directly, because
 * `assert.isTrue` here takes no message argument — this way a failure still
 * prints which file it was and what the validator objected to.
 */
const outcomeOf = (
  name: string,
  result: ReturnType<typeof RulesetPicked.validate>,
): string =>
  Result.isErr(result)
    ? (`${name}: ${validationErrorsToMessages(result.value).join('\n')}` as const)
    : name;

const validRuleset = {
  id: 1,
  name: 'x',
  target: 'branch',
  enforcement: 'active',
  bypass_actors: [],
  conditions: { ref_name: { include: [], exclude: [] } },
  rules: [{ type: 'deletion' }],
} as const;

describe('the ruleset schema', () => {
  test('accepts every ruleset this repository declares', async () => {
    const files = await readJsonFilesIn(rulesetsDir);

    assert.isTrue(Arr.isNonEmpty(files));

    for (const [name, content] of files) {
      assert.deepStrictEqual(
        outcomeOf(name, RulesetPicked.validate(content)),
        name,
      );
    }
  });

  test('accepts every backed-up ruleset', async () => {
    const files = await readJsonFilesIn(path.resolve(rulesetsDir, './bk'));

    assert.isTrue(Arr.isNonEmpty(files));

    for (const [name, content] of files) {
      assert.deepStrictEqual(
        outcomeOf(name, RulesetPicked.validate(content)),
        name,
      );
    }
  });

  test('accepts the fields GitHub adds to what apply sends back', async () => {
    const files = await readJsonFilesIn(rulesetsDir);

    assert.isTrue(Arr.isNonEmpty(files));

    const declared = RulesetPicked.validate(files[0][1]);

    assert.deepStrictEqual(outcomeOf(files[0][0], declared), files[0][0]);

    if (Result.isOk(declared)) {
      // `getRuleset` hands the whole API response to this type, and a response
      // carries more than the seven fields that go back out again.
      const result = RulesetPicked.validate({
        ...declared.value,
        source: 'noshiro-pf/mono',
        source_type: 'Repository',
        node_id: 'RRS_lACqUmVwb3NpdG9yeQ',
      });

      assert.isTrue(Result.isOk(result));
    }
  });

  test('accepts a ruleset built from values GitHub does use', () => {
    // The control for the two rejections below: without it they could be
    // passing for some reason other than the field under test.
    assert.isTrue(Result.isOk(RulesetPicked.validate(validRuleset)));
  });

  test('rejects an enforcement value GitHub does not use', () => {
    const result = RulesetPicked.validate({
      ...validRuleset,
      enforcement: 'enabled',
    });

    assert.isTrue(Result.isErr(result));
  });

  test('rejects a rule type GitHub does not define', () => {
    const result = RulesetPicked.validate({
      ...validRuleset,
      rules: [{ type: 'no_such_rule' }],
    });

    assert.isTrue(Result.isErr(result));
  });

  test('narrows to the seven fields apply sends, which is what backup writes', () => {
    // Validation is a check rather than a filter, so `Obj.pick` is the step
    // that narrows — this mirrors what `backupRulesets` does to a response
    // before writing it.
    const picked = Obj.pick(
      {
        ...validRuleset,
        source: 'noshiro-pf/mono',
        source_type: 'Repository',
        node_id: 'RRS_lACqUmVwb3NpdG9yeQ',
      },
      rulesetKeysToPick,
    );

    assert.deepStrictEqual(Object.keys(picked).toSorted(), [
      'bypass_actors',
      'conditions',
      'enforcement',
      'id',
      'name',
      'rules',
      'target',
    ]);
  });
});
