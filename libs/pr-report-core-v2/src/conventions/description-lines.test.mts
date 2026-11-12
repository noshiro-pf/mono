import { isMergesBeforeNote } from './description-lines.mjs';

describe(isMergesBeforeNote, () => {
  test.each([
    'Merges before #7, whose `Merge-After:` names this one.',
    'Merges before #7, #8, whose `Merge-After:` names this one.  ',
    '   Merges before #7, whose `Merge-After:` names this one.',
  ])('is the line open-pr writes, as a paragraph may indent it: %s', (line) => {
    assert.isTrue(isMergesBeforeNote(line));
  });

  // A person's sentence that starts the same way, or a sample in an indented
  // code block, stays theirs.
  test.each([
    'Merges before #12 lands, the API is frozen.',
    'Merges before #7, which closes #3.',
    '    Merges before #7, whose `Merge-After:` names this one.',
    'Merges before #7 and #8, whose `Merge-After:` names this one.',
  ])('is no other line: %s', (line) => {
    assert.isFalse(isMergesBeforeNote(line));
  });
});
