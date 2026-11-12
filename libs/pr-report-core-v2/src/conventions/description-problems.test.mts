import { descriptionProblems } from './description.mjs';

describe(descriptionProblems, () => {
  test('takes any body when no heading is configured', () => {
    assert.isUndefined(
      descriptionProblems('A.', undefined, 'pull-request', undefined),
    );
  });

  test('passes a body whose halves mirror each other', () => {
    assert.isUndefined(
      descriptionProblems(
        'A (#1).\n\n## 日本語\n\nあ (#1)。\n',
        '日本語',
        'pull-request',
        undefined,
      ),
    );
  });

  test('refuses a body without its translation', () => {
    assert.include(
      descriptionProblems('A.', '日本語', 'pull-request', undefined),
      '## 日本語',
    );
  });

  test('lists every problem', () => {
    const problems = descriptionProblems(
      'A (#1).\n\n## B\n\n## 日本語\n\nあ。\n',
      '日本語',
      'pull-request',
      undefined,
    );

    assert.include(problems, 'the headings do not mirror');

    assert.include(problems, '#1');
  });

  test('refuses a trailer in a half under the headline', () => {
    const problems = descriptionProblems(
      'A.\n\nCloses #1\n\n## 日本語\n\nあ。\n',
      '日本語',
      'pull-request',
      undefined,
    );

    assert.include(problems, 'the description cannot be posted as it is:');

    assert.include(
      problems,
      'the original has the closing keyword "Closes #1"',
    );
  });

  test('reads a closing keyword in an issue as prose', () => {
    assert.isUndefined(
      descriptionProblems(
        'A resolves #1.\n\n## 日本語\n\nA は #1 を解決する。\n',
        '日本語',
        'issue',
        undefined,
      ),
    );
  });

  test('asks a pull request for the opening heading when one is configured', () => {
    assert.include(
      descriptionProblems(
        '## Summary\n\nA.\n\n## 日本語\n\n### 概要\n\nあ。\n',
        '日本語',
        'pull-request',
        'Background',
      ),
      'opens with "## Summary"',
    );

    assert.isUndefined(
      descriptionProblems(
        '## Background\n\nA.\n\n## 日本語\n\n### 背景\n\nあ。\n',
        '日本語',
        'pull-request',
        'Background',
      ),
    );
  });

  test('asks an issue for no opening heading', () => {
    assert.isUndefined(
      descriptionProblems(
        'A.\n\n## 日本語\n\nあ。\n',
        '日本語',
        'issue',
        'Background',
      ),
    );
  });
});
