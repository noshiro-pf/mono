import { Button } from 'blueprint-synstate';
import {
  constant,
  createAfterUpdate,
  derive,
  view,
  type JSX,
} from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';
import { CreateEventScheduleStore } from '../../../store/index.mjs';
import {
  CreateEventResultDialog,
  Header,
  ResetButton,
} from '../../organisms/index.mjs';
import { ButtonsWrapperForEventSettingsPage } from '../../styled/index.mjs';
import { EventScheduleSettingCommon } from './event-schedule-setting-common.js';

const dc = dict.eventSettingsPage;

export const CreateEventSchedule = (): JSX.Element => {
  // After the update that opened the page.
  createAfterUpdate()(CreateEventScheduleStore.restoreFromLocalStorage);

  const { isLoading$, hasNoChanges$, commonState$ } = CreateEventScheduleStore;

  return (
    <div data-e2e={constant('create-page')}>
      <Header title={dc.title} />
      <EventScheduleSettingCommon
        handlers={CreateEventScheduleStore.commonStateHandlers}
        state$={commonState$}
      />
      <ButtonsWrapperForEventSettingsPage>
        <ResetButton
          disabled={derive(
            [isLoading$, hasNoChanges$],
            (loading, noChanges) => loading || noChanges,
          )}
          onConfirmClick={CreateEventScheduleStore.resetAllState}
        />
        <Button
          data-e2e={constant('create-button')}
          disabled={view(commonState$, (s) => !s.eventScheduleValidationOk)}
          intent={'primary'}
          loading={isLoading$}
          text={constant(dc.createEventButton)}
          onClick={CreateEventScheduleStore.onCreateEventClick}
        />
        <CreateEventResultDialog
          isLoading={isLoading$}
          isOpen={CreateEventScheduleStore.createResultDialogIsOpen$}
          url={CreateEventScheduleStore.url$}
        />
      </ButtonsWrapperForEventSettingsPage>
    </div>
  );
};
