import { firestorePaths } from 'event-schedule-app-shared';
import { isCurrentEventAnswerPath } from './is-current-event-answer-path.mjs';

describe(isCurrentEventAnswerPath, () => {
  test('is true for an answer of a current event', () => {
    assert.isTrue(
      isCurrentEventAnswerPath(
        `${firestorePaths.events}/event-1/${firestorePaths.answers}/answer-1`,
      ),
    );
  });

  test('is false for an answer under an older events collection', () => {
    assert.isFalse(
      isCurrentEventAnswerPath(`events_v3/event-1/${firestorePaths.answers}/a`),
    );
  });

  test('is false for an answers collection nested elsewhere', () => {
    assert.isFalse(
      isCurrentEventAnswerPath(
        `${firestorePaths.events}/event-1/other/x/${firestorePaths.answers}/a`,
      ),
    );
  });
});
