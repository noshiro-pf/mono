import { css } from '@emotion/react';
import { memoNamed } from 'react-utils';
import { errorFontColor } from '../../constants/index.mjs';
import { type EventScheduleValidation } from '../../types/index.mjs';
import { Description } from '../atoms/index.mjs';

const dc = dict.eventSettingsPage;

type Props = Readonly<{ eventScheduleValidation: EventScheduleValidation }>;

export const EventSchedulePropertiesErrors = memoNamed<Props>(
  'EventSchedulePropertiesErrors',
  ({ eventScheduleValidation }) => (
    <div
      css={css`
        margin: 10px;
      `}
    >
      {eventScheduleValidation.title ? undefined : (
        <Description
          color={errorFontColor}
          text={dc.errorMessages.titleIsEmpty}
        />
      )}
      {eventScheduleValidation.datetimeRangeList ? undefined : (
        <Description
          color={errorFontColor}
          text={dc.errorMessages.datetimeIsEmpty}
        />
      )}
      {eventScheduleValidation.notificationEmail ? undefined : (
        <Description
          color={errorFontColor}
          text={dict.common.error.invalidEmail}
        />
      )}
      {eventScheduleValidation.notificationItems ? undefined : (
        <Description
          color={errorFontColor}
          text={dc.errorMessages.atLeastOneNotificationCheckRequired}
        />
      )}
      {eventScheduleValidation.answerIcons ? undefined : (
        <Description
          color={errorFontColor}
          text={dc.errorMessages.answerIcons}
        />
      )}
    </div>
  ),
);
