import { descriptionProblems } from './main.mjs';

describe(descriptionProblems, () => {
  test('takes any body when no heading is configured', () => {
    assert.isUndefined(descriptionProblems('A.', undefined));
  });

  test('passes a body whose halves mirror each other', () => {
    assert.isUndefined(
      descriptionProblems('A (#1).\n\n## 日本語\n\nあ (#1)。\n', '日本語'),
    );
  });

  test('refuses a body without its translation', () => {
    assert.include(descriptionProblems('A.', '日本語'), '## 日本語');
  });

  test('lists every problem', () => {
    const problems = descriptionProblems(
      'A (#1).\n\n## B\n\n## 日本語\n\nあ。\n',
      '日本語',
    );

    assert.include(problems, 'the headings do not mirror');

    assert.include(problems, '#1');
  });

  test('refuses a trailer in a half under the layout headline', () => {
    const problems = descriptionProblems(
      'A.\n\nCloses #1\n\n## 日本語\n\nあ。\n',
      '日本語',
    );

    assert.include(
      problems,
      'the description is not laid out as the original, its translation, then the trailers:',
    );

    assert.include(problems, 'the original has the trailer "Closes #1"');
  });
});
