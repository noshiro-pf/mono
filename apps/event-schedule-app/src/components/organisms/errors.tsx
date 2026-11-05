import type { InitializedObservable } from 'synstate';
import { constant, If, view, type JSX } from 'synstate-dom';
import { dict, errorFontColor } from '../../constants/index.mjs';
import type { EventScheduleValidation } from '../../types/index.mjs';
import { Description } from '../atoms/index.mjs';
import * as styles from './errors.module.css';

const dc = dict.eventSettingsPage;

type Props = Readonly<{
  eventScheduleValidation: InitializedObservable<EventScheduleValidation>;
}>;

/** What keeps the event from being saved, one line each. */
export const EventSchedulePropertiesErrors = ({
  eventScheduleValidation,
}: Props): JSX.Element => {
  const error = (
    isValid: (v: EventScheduleValidation) => boolean,
    text: string,
  ): JSX.Element => (
    <If
      cond={view(eventScheduleValidation, (v) => !isValid(v))}
      then={<Description color={errorFontColor} text={constant(text)} />}
    />
  );

  return (
    <div class={constant(styles.errors)}>
      {error((v) => v.title, dc.errorMessages.titleIsEmpty)}
      {error((v) => v.datetimeRangeList, dc.errorMessages.datetimeIsEmpty)}
      {error((v) => v.notificationEmail, dict.common.error.invalidEmail)}
      {error(
        (v) => v.notificationItems,
        dc.errorMessages.atLeastOneNotificationCheckRequired,
      )}
      {error((v) => v.answerIcons, dc.errorMessages.answerIcons)}
    </div>
  );
};
