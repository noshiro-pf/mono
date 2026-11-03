import { IMapMapped, Optional } from 'ts-data-forge';
import {
  datetimeRangeInitialValue,
  defaultIconPoint,
} from '../../constants/index.mjs';
import {
  datetimeRangeFromMapKey,
  datetimeRangeToMapKey,
} from '../map-key/index.mjs';
import {
  answerSelectionReducer,
  type AnswerSelectionReducerState,
} from './answer-selection-reducer.mjs';

describe(answerSelectionReducer, () => {
  const empty: AnswerSelectionReducerState = IMapMapped.create(
    [],
    datetimeRangeToMapKey,
    datetimeRangeFromMapKey,
  );

  // A range not yet in the selection is stored as fair for any point. The
  // point is not used to infer the icon, so 0 and 10 do not become good or poor.
  test.each([0, 5, 10])(
    'cell-point on a missing range with point %d stores fair',
    (point) => {
      const next = answerSelectionReducer(empty, {
        type: 'cell-point',
        datetimeRange: datetimeRangeInitialValue,
        point,
      });

      assert.deepStrictEqual(
        Optional.toNullable(next.get(datetimeRangeInitialValue)),
        { iconId: 'fair', point, comment: '' },
      );
    },
  );

  test.each(['good', 'fair', 'poor'] as const)(
    'cell-icon on a missing range with %s stores that icon and its default point',
    (icon) => {
      const next = answerSelectionReducer(empty, {
        type: 'cell-icon',
        datetimeRange: datetimeRangeInitialValue,
        icon,
      });

      assert.deepStrictEqual(
        Optional.toNullable(next.get(datetimeRangeInitialValue)),
        { iconId: icon, point: defaultIconPoint[icon], comment: '' },
      );
    },
  );

  test('cell-comment on a missing range stores none with point 0 and the comment', () => {
    const next = answerSelectionReducer(empty, {
      type: 'cell-comment',
      datetimeRange: datetimeRangeInitialValue,
      comment: 'note',
    });

    assert.deepStrictEqual(
      Optional.toNullable(next.get(datetimeRangeInitialValue)),
      { iconId: 'none', point: 0, comment: 'note' },
    );
  });
});
