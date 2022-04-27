import { Button } from '@blueprintjs/core';
import { CreateEventScheduleStore } from '../../../store';
import { CreateEventResultDialog, Header, ResetButton } from '../../organisms';
import { ButtonsWrapperForEventSettingsPage } from '../../styled';
import { EventScheduleSettingCommon } from './event-schedule-setting-common';

const dc = dict.eventSettingsPage;

export const CreateEventSchedule = memoNamed('CreateEventSchedule', () => {
  const commonState = useObservableValue(CreateEventScheduleStore.commonState$);

  useEffect(() => {
    CreateEventScheduleStore.restoreFromLocalStorage();
  }, []);

  const { eventScheduleValidationOk } = commonState;

  const createButtonIsLoading = useObservableValue(
    CreateEventScheduleStore.isLoading$
  );

  const createResultDialogIsOpen = useObservableValue(
    CreateEventScheduleStore.createResultDialogIsOpen$
  );

  const url = useObservableValue(CreateEventScheduleStore.url$);

  const hasNoChanges = useObservableValue(
    CreateEventScheduleStore.hasNoChanges$
  );

  return (
    <div data-cy={'create-page'}>
      <Header title={dc.title} />
      <EventScheduleSettingCommon
        handlers={CreateEventScheduleStore.commonStateHandlers}
        state={commonState}
      />
      <ButtonsWrapperForEventSettingsPage>
        <ResetButton
          disabled={createButtonIsLoading || hasNoChanges}
          onConfirmClick={CreateEventScheduleStore.resetAllState}
        />
        <Button
          data-cy={'create-button'}
          disabled={!eventScheduleValidationOk}
          intent={'primary'}
          loading={createButtonIsLoading}
          text={dc.createEventButton}
          onClick={CreateEventScheduleStore.onCreateEventClick}
        />
        <CreateEventResultDialog
          isLoading={createButtonIsLoading}
          isOpen={createResultDialogIsOpen}
          url={url}
        />
      </ButtonsWrapperForEventSettingsPage>
    </div>
  );
});
