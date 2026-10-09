import { asTaskId, createTask } from '../domain/index.mjs';
import { taskFromDoc, taskToDoc } from './converters.mjs';
import { readValidDocs } from './read-docs.mjs';

describe(readValidDocs, () => {
  test('keeps the valid documents, in creation order, and warns about the rest', () => {
    const later = createTask({ id: asTaskId('a'), title: 'A', now: 20 });

    const earlier = createTask({ id: asTaskId('b'), title: 'B', now: 10 });

    const tie = createTask({ id: asTaskId('c'), title: 'C', now: 10 });

    const mut_warnings: string[] = [];

    const tasks = readValidDocs(
      [
        { id: 'a', data: taskToDoc(later) },
        { id: 'broken', data: { title: 1 } },
        { id: 'c', data: taskToDoc(tie) },
        { id: 'b', data: taskToDoc(earlier) },
      ],
      taskFromDoc,
      (message) => {
        mut_warnings.push(message);
      },
    );

    assert.deepStrictEqual(tasks, [earlier, tie, later]);

    assert.strictEqual(mut_warnings.length, 1);

    assert.include(mut_warnings[0], '"broken"');
  });
});
