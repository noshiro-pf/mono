import { defaultSimulationInput } from '../domain/index.mjs';
import { planFromDoc, planToDoc, type Plan } from './plan-doc.mjs';
import { readValidDocs } from './read-docs.mjs';

const plan = (id: string, createdAt: number): Plan =>
  ({
    id,
    name: id,
    createdAt,
    updatedAt: createdAt,
    input: defaultSimulationInput,
  }) as const;

describe(readValidDocs, () => {
  test('keeps the valid documents, in creation order, and warns about the rest', () => {
    const later = plan('a', 20);

    const earlier = plan('b', 10);

    const tie = plan('c', 10);

    const mut_warnings: string[] = [];

    const plans = readValidDocs(
      [
        { id: 'a', data: planToDoc(later) },
        { id: 'broken', data: { name: 1 } },
        { id: 'c', data: planToDoc(tie) },
        { id: 'b', data: planToDoc(earlier) },
      ],
      planFromDoc,
      (message) => {
        mut_warnings.push(message);
      },
    );

    assert.deepStrictEqual(plans, [earlier, tie, later]);

    assert.strictEqual(mut_warnings.length, 1);

    assert.include(mut_warnings[0], '"broken"');
  });
});
