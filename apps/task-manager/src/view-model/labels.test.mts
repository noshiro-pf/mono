// cspell:ignore ｄｏｃｓ

import { asTaskId, createTask, type Task } from '../domain/index.mjs';
import {
  formatLabels,
  labelsByUse,
  parseLabels,
  spellAsInUse,
  splitTypedLabels,
  suggestLabels,
} from './labels.mjs';

describe(parseLabels, () => {
  test('splits on ASCII and Japanese commas, and trims', () => {
    assert.deepStrictEqual(parseLabels(' docs, ui、設計，バグ '), [
      'docs',
      'ui',
      '設計',
      'バグ',
    ]);
  });

  test('drops empty entries and repeats', () => {
    assert.deepStrictEqual(parseLabels('a,, a ,b,'), ['a', 'b']);

    assert.deepStrictEqual(parseLabels(' '.repeat(3)), []);
  });
});

describe(formatLabels, () => {
  test('joins with a comma, which parseLabels reads back', () => {
    assert.strictEqual(formatLabels(['a', 'b']), 'a, b');

    assert.deepStrictEqual(parseLabels(formatLabels(['x', 'y z'])), [
      'x',
      'y z',
    ]);
  });
});

describe(splitTypedLabels, () => {
  test('is the labels before the last comma, and what is typed after it', () => {
    assert.deepStrictEqual(splitTypedLabels('a, b、 de'), {
      ended: ['a', 'b'],
      rest: 'de',
    });

    assert.deepStrictEqual(splitTypedLabels('a，'), { ended: ['a'], rest: '' });

    assert.deepStrictEqual(splitTypedLabels('abc'), { ended: [], rest: 'abc' });
  });
});

const task = (id: string, labels: readonly string[]): Task =>
  ({
    ...createTask({ id: asTaskId(id), title: id, now: 0 }),
    labels,
  }) as const;

describe(labelsByUse, () => {
  test('is every label on a task, the most used first, then by name', () => {
    assert.deepStrictEqual(
      labelsByUse({
        tasks: [
          task('a', ['ui', 'docs']),
          task('b', ['api', 'docs']),
          task('c', ['docs', 'api']),
        ],
        milestones: [],
      }),
      ['docs', 'api', 'ui'],
    );
  });

  test('is a label used in several cases once, as most used, counting them all', () => {
    assert.deepStrictEqual(
      labelsByUse({
        tasks: [
          task('a', ['ui', 'docs']),
          task('b', ['UI', 'docs']),
          task('c', ['UI']),
        ],
        milestones: [],
      }),
      ['UI', 'docs'],
    );
  });
});

describe(spellAsInUse, () => {
  test('spells each label as the first in use that is the same in some case or width', () => {
    assert.deepStrictEqual(
      spellAsInUse(['ui', 'ｄｏｃｓ', 'new'], ['UI', 'docs', 'ui']),
      ['UI', 'docs', 'new'],
    );
  });
});

describe(suggestLabels, () => {
  const known = ['docs', 'api', 'ui', 'UI設計', 'design'] as const;

  test('is the labels that start with what is typed, then those that contain it, ignoring case', () => {
    assert.deepStrictEqual(suggestLabels(known, [], 'd'), ['docs', 'design']);

    assert.deepStrictEqual(suggestLabels(known, [], 'Ui'), ['ui', 'UI設計']);

    assert.deepStrictEqual(suggestLabels(known, [], 'ｕｉ'), ['ui', 'UI設計']);

    assert.deepStrictEqual(suggestLabels(known, [], ' si'), ['design']);
  });

  test('leaves out the labels already chosen, in any case', () => {
    assert.deepStrictEqual(suggestLabels(known, ['DOCS'], 'd'), ['design']);
  });

  test('is none while nothing is typed', () => {
    assert.deepStrictEqual(suggestLabels(known, [], '  '), []);
  });

  test('is at most eight', () => {
    assert.strictEqual(
      suggestLabels(
        Array.from({ length: 12 }, (_, index) => `l${index}`),
        [],
        'l',
      ).length,
      8,
    );
  });
});
