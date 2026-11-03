import { SUCC } from '../parser/index.mjs';
import { termToString } from './term-to-string.mjs';

describe(termToString, () => {
  test('prints SUCC by its name', () => {
    assert.strictEqual(termToString(SUCC), 'SUCC');
  });

  test('prints a term that only looks like SUCC after capture in full', () => {
    // Renaming SUCC's `n` to `s` makes the bodies identical, but captures `s`.
    assert.strictEqual(
      termToString([
        'lambda',
        's',
        ['lambda', 's', ['lambda', 'z', ['s', [['s', 's'], 'z']]]],
      ]),
      '(λs.(λs.(λz.(s ((s s) z)))))',
    );
  });
});
