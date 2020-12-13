import { IOptionProps } from '@blueprintjs/core';
import { texts } from '../../../../constants/texts';
import { datetimeSpecificationOptions } from '../../../../types/enum/datetime-specification-type';

const vt = texts.createEventPage.section2;

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
