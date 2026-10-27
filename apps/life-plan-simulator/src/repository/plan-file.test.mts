import * as fs from 'node:fs';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { defaultSimulationInput } from '../domain/index.mjs';
import {
  parsePlanFile,
  PlanFile,
  planFileName,
  planFileSchemaUrl,
  planToFileJson,
} from './plan-file.mjs';

describe(planToFileJson, () => {
  test('writes the schema URL, the name and the inputs', () => {
    assert.deepStrictEqual(
      JSON.parse(
        planToFileJson({ name: '持ち家', input: defaultSimulationInput }),
      ),
      {
        $schema: planFileSchemaUrl,
        name: '持ち家',
        input: defaultSimulationInput,
      },
    );
  });

  test('is what PlanFile accepts', () => {
    assert.isTrue(
      PlanFile.is(
        JSON.parse(
          planToFileJson({ name: '持ち家', input: defaultSimulationInput }),
        ),
      ),
    );
  });
});

describe(parsePlanFile, () => {
  test('reads back what planToFileJson wrote, with nothing to report', () => {
    const result = parsePlanFile(
      planToFileJson({ name: '持ち家', input: defaultSimulationInput }),
    );

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(Result.unwrapOk(result), {
      name: '持ち家',
      input: defaultSimulationInput,
      warnings: [],
    });
  });

  test('fills what is missing and says which values it replaced', () => {
    const result = parsePlanFile(
      JSON.stringify({
        name: 'a',
        input: {
          profile: { birth: '1985-07', endAge: 'ninety' },
          rent: { monthly: 70_000 },
        },
      }),
    );

    assert.isTrue(Result.isOk(result));

    const { input, warnings } = Result.unwrapOk(result);

    assert.strictEqual(input.profile.birth, '1985-07');

    assert.strictEqual(
      input.profile.endAge,
      defaultSimulationInput.profile.endAge,
    );

    assert.strictEqual(input.rent.monthly, 70_000);

    assert.deepStrictEqual(input.nisa, defaultSimulationInput.nisa);

    assert.isTrue(warnings.some((w) => w.includes('endAge')));
  });

  test('reads a file of the inputs alone, as the first version wrote', () => {
    const result = parsePlanFile(
      JSON.stringify({ ...defaultSimulationInput, rent: { monthly: 1 } }),
    );

    assert.isTrue(Result.isOk(result));

    const { name, input } = Result.unwrapOk(result);

    assert.isUndefined(name);

    assert.strictEqual(input.rent.monthly, 1);
  });

  test('leaves out a name that is blank or not a string', () => {
    for (const name of ['  ', 3]) {
      const result = parsePlanFile(
        JSON.stringify({ name, input: defaultSimulationInput }),
      );

      assert.isTrue(Result.isOk(result));

      assert.isUndefined(Result.unwrapOk(result).name);
    }
  });

  test('rejects what is not a plan', () => {
    for (const json of [
      '{',
      '[]',
      '"plan"',
      '{"name": "a"}',
      '{"input": 3}',
      '{"other": {}}',
    ]) {
      assert.isTrue(Result.isErr(parsePlanFile(json)));
    }
  });
});

describe(planFileName, () => {
  test('is the plan name with the characters a file name cannot hold replaced', () => {
    assert.strictEqual(planFileName('持ち家'), '持ち家.json');

    assert.strictEqual(planFileName('a/b:c?'), 'a_b_c_.json');

    assert.strictEqual(planFileName(' '), 'plan.json');
  });
});

describe('public/plan-file.schema.json', () => {
  test('is what gen:schema writes from PlanFile', () => {
    const written: unknown = JSON.parse(
      fs.readFileSync(
        path.resolve(import.meta.dirname, '../../public/plan-file.schema.json'),
        'utf8',
      ),
    );

    assert.deepStrictEqual(written, Result.unwrapOk(t.toJsonSchema(PlanFile)));
  });
});
