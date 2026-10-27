import type { Label } from 'pr-report-core';
import { isPriorityLabel, priorityOf } from './priority.mjs';

describe(priorityOf, () => {
  test('reads the one priority label a pull request carries', () => {
    assert.strictEqual(priorityOf([label('priority:high')]), 'high');

    assert.strictEqual(
      priorityOf([label('skip-ci'), label('priority:mid')]),
      'mid',
    );

    assert.strictEqual(priorityOf([label('priority:low')]), 'low');
  });

  test('none, or more than one, is no priority', () => {
    assert.strictEqual(priorityOf([]), 'none');

    assert.strictEqual(
      priorityOf([label('priority:high'), label('priority:low')]),
      'none',
    );
  });
});

describe(isPriorityLabel, () => {
  test('the three priority labels, and nothing else', () => {
    assert.isTrue(isPriorityLabel('priority:high'));

    assert.isTrue(isPriorityLabel('priority:mid'));

    assert.isTrue(isPriorityLabel('priority:low'));

    assert.isFalse(isPriorityLabel('priority:urgent'));

    assert.isFalse(isPriorityLabel('bug'));
  });
});

const label = (labelName: string): Label =>
  ({
    name: labelName,
    color: 'ededed',
    description: '',
  }) as const;
