import { datetimeSpecificationOptions } from '@noshiro/event-schedule-app-shared';

const dc = dict.eventSettingsPage.section2;

export const selectorOptions: readonly OptionProps[] = [
  {
    label: dc.datetimeSpecificationOptions.noStartEndSpecified,
    value: datetimeSpecificationOptions.noStartEndSpecified,
  },
  {
    label: dc.datetimeSpecificationOptions.startSpecified,
    value: datetimeSpecificationOptions.startSpecified,
  },
  {
    label: dc.datetimeSpecificationOptions.endSpecified,
    value: datetimeSpecificationOptions.endSpecified,
  },
  {
    label: dc.datetimeSpecificationOptions.startAndEndSpecified,
    value: datetimeSpecificationOptions.startAndEndSpecified,
  },
] as const;