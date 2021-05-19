import type { IOptionProps } from '@blueprintjs/core';
import { texts } from '../../../../constants';
import { datetimeSpecificationOptions } from '../../../../types';

const vt = texts.eventSettingsPage.section2;

export const selctorOptions: IOptionProps[] = [
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
];
