import { Result } from 'ts-data-forge';
import { defaultSimulationInput } from '../domain/index.mjs';
import { planFromDoc, planToDoc, type Plan } from './plan-doc.mjs';

const plan: Plan = {
  id: 'p1',
  name: '持ち家',
  createdAt: 10,
  updatedAt: 20,
  input: defaultSimulationInput,
} as const;

describe(planFromDoc, () => {
  test('reads back what planToDoc wrote', () => {
    const result = planFromDoc('p1', planToDoc(plan));

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(Result.unwrapOk(result), plan);
  });

  test('fills the inputs a document saved by an older version lacks', () => {
    const result = planFromDoc('p1', {
      name: '持ち家',
      createdAt: 10,
      updatedAt: 20,
      input: { profile: { birth: '1985-07' } },
    });

    assert.isTrue(Result.isOk(result));

    const { input } = Result.unwrapOk(result);

    assert.strictEqual(input.profile.birth, '1985-07');

    assert.deepStrictEqual(
      input.salaryHistory,
      defaultSimulationInput.salaryHistory,
    );
  });

  test('rejects a document without a name or times', () => {
    assert.isTrue(Result.isErr(planFromDoc('p1', { name: 'a' })));

    assert.isTrue(Result.isErr(planFromDoc('p1', 'a')));
  });
});
