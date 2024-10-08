import { errorFontColor } from '../../constants';
import { type EventScheduleValidation } from '../../types';
import { Description } from '../atoms';

const dc = dict.eventSettingsPage;

type Props = Readonly<{
  eventScheduleValidation: EventScheduleValidation;
}>;

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
