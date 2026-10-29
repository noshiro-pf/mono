import { createState } from 'synstate';
import { Result } from 'ts-data-forge';
import { createErrorType } from './fetched-values-state.mjs';
import type {
  AnswersResult,
  EventScheduleResult,
} from './fetching-state/index.mjs';

describe(createErrorType, () => {
  test('is undefined while neither read has failed', () => {
    const { errorType$ } = setup();

    assert.isUndefined(errorType$.getSnapshot().value);
  });

  test('names the failed read, the event’s before the answers’', () => {
    const { errorType$, setEventSchedule, setAnswers } = setup();

    setAnswers(Result.err({ type: 'others', message: 'a' }));

    assert.deepStrictEqual(errorType$.getSnapshot().value, {
      data: 'answersResult',
      type: { type: 'others', message: 'a' },
    });

    setEventSchedule(Result.err({ type: 'not-found', message: 'e' }));

    assert.deepStrictEqual(errorType$.getSnapshot().value, {
      data: 'eventScheduleResult',
      type: { type: 'not-found', message: 'e' },
    });
  });
});

const setup = (): Readonly<{
  errorType$: ReturnType<typeof createErrorType>;
  setEventSchedule: (result: EventScheduleResult) => void;
  setAnswers: (result: AnswersResult) => void;
}> => {
  const [eventSchedule$, setEventSchedule] =
    createState<EventScheduleResult>(undefined);

  const [answers$, setAnswers] = createState<AnswersResult>(undefined);

  return {
    errorType$: createErrorType(eventSchedule$, answers$),
    setEventSchedule,
    setAnswers,
  } as const;
};
