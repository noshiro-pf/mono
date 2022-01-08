import type { OptionProps } from '@blueprintjs/core';
import { datetimeSpecificationOptions } from '@noshiro/event-schedule-app-shared';
import { dict } from '../../constants';

const vt = dict.eventSettingsPage.section2;

export const selectorOptions: readonly OptionProps[] = [
  {
    label: vt.datetimeSpecificationOptions.noStartEndSpecified,
    value: datetimeSpecificationOptions.noStartEndSpecified,
  },
  {
    label: vt.datetimeSpecificationOptions.startSpecified,
    value: datetimeSpecificationOptions.startSpecified,
  },
  {
    label: vt.datetimeSpecificationOptions.endSpecified,
    value: datetimeSpecificationOptions.endSpecified,
  },
  {
    label: vt.datetimeSpecificationOptions.startAndEndSpecified,
    value: datetimeSpecificationOptions.startAndEndSpecified,
  },
] as const;
