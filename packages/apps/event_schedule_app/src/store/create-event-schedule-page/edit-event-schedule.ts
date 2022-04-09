import { deepEqual } from '@noshiro/fast-deep-equal';
import { initialEventSchedule } from '../../constants';
import type { EventSettingsPageDiffResult } from '../../functions';
import { collectEventSettingsPageDiff } from '../../functions';
import { createEventScheduleSettingStore } from './event-schedule-setting-common';

export namespace EditEventSchedule {
  export const { commonState$, commonStateHandlers } =
    createEventScheduleSettingStore();

  export const diff$: InitializedObservable<EventSettingsPageDiffResult> =
    commonState$.chain(
      mapI(({ newEventSchedule }) =>
        collectEventSettingsPageDiff(initialEventSchedule, newEventSchedule)
      )
    );

  export const hasDeletedDatetimeChanges$: InitializedObservable<boolean> =
    diff$.chain(
      mapI(
        (diff) =>
          diff.datetimeRangeList?.deleted !== undefined &&
          IList.isNonEmpty(diff.datetimeRangeList.deleted)
      )
    );

  export const hasNoChanges$: InitializedObservable<boolean> =
    commonState$.chain(
      mapI(({ newEventSchedule }) =>
        deepEqual(initialEventSchedule, newEventSchedule)
      )
    );
}
