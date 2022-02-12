import { memoNamed } from '@noshiro/react-utils';
import { dict, initialEventSchedule } from '../../../constants';
import { Header } from '../../organisms';
import { EventScheduleSettingCommon } from './event-schedule-setting-common';

const dc = dict.eventSettingsPage;

export const CreateEventSchedule = memoNamed('CreateEventSchedule', () => (
  <div>
    <Header title={dc.title} />
    <EventScheduleSettingCommon
      initialValues={initialEventSchedule}
      mode={'create'}
    />
  </div>
));
