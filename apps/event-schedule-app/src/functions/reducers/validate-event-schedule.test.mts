import { answerIconsInitialValue } from '../../constants/index.mjs';
import { validateEventSchedule } from './validate-event-schedule.mjs';

const validateAnswerIcons = (answerIcons: AnswerIconSettings): boolean =>
  validateEventSchedule({
    title: 'title',
    datetimeRangeList: [],
    answerIcons,
    notificationSettingsWithEmail: 'none',
  }).answerIcons;

describe('validateEventSchedule answerIcons', () => {
  test('passes the initial icon settings', () => {
    assert.isTrue(validateAnswerIcons(answerIconsInitialValue));
  });

  test.each(['good', 'fair', 'poor'] as const)(
    'fails when the description of %s is empty',
    (key) => {
      assert.isFalse(
        validateAnswerIcons({
          ...answerIconsInitialValue,
          [key]: { ...answerIconsInitialValue[key], description: '' },
        }),
      );
    },
  );

  test.each([0, 10] as const)('fails when the fair point is %d', (point) => {
    assert.isFalse(
      validateAnswerIcons({
        ...answerIconsInitialValue,
        fair: { ...answerIconsInitialValue.fair, point },
      }),
    );
  });

  test.each([0.1, 9.9] as const)(
    'passes when the fair point is %d',
    (point) => {
      assert.isTrue(
        validateAnswerIcons({
          ...answerIconsInitialValue,
          fair: { ...answerIconsInitialValue.fair, point },
        }),
      );
    },
  );
});
