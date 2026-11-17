import { failureLines } from './failure-lines.mjs';

describe(failureLines, () => {
  test('says each failure once, in the order first met', () => {
    assert.deepStrictEqual(
      failureLines([
        { kind: 'malformed', what: 'the base changes of #7', message: 'x' },
        { kind: 'refused', what: 'the checks of #8', message: 'y' },
        // The merged parent fails with the base changes it was read from.
        { kind: 'malformed', what: 'the base changes of #7', message: 'x' },
      ]),
      ['the base changes of #7 (x)', 'the checks of #8 (y)'],
    );
  });
});
