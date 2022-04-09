import { Button } from '@blueprintjs/core';
import { dict } from '../../../constants';
import { useCreateEventScheduleHooks } from '../../../hooks';
import { CreateEventResultDialog, Header, ResetButton } from '../../organisms';
import { ButtonsWrapperForEventSettingsPage } from '../../styled';
import { EventScheduleSettingCommon } from './event-schedule-setting-common';

const dc = dict.eventSettingsPage;

export const CreateEventSchedule = memoNamed('CreateEventSchedule', () => {
  const {
    commonState,
    commonStateHandlers,
    resetAllState,
    createButtonIsEnabled,
    createButtonIsLoading,
    onCreateEventClick,
    createResultDialogIsOpen,
    closeCreateResultDialog,
    onClipboardButtonClick,
    url,
    isLoading,
  } = useCreateEventScheduleHooks();

  const { hasNoChanges } = commonState;

  return (
    <div>
      <Header title={dc.title} />
      <EventScheduleSettingCommon
        handlers={commonStateHandlers}
        state={commonState}
      />
      <ButtonsWrapperForEventSettingsPage>
        <ResetButton
          disabled={createButtonIsLoading || hasNoChanges}
          onConfirmClick={resetAllState}
        />
        <Button
          disabled={!createButtonIsEnabled}
          intent={'primary'}
          loading={createButtonIsLoading}
          text={dc.createEventButton}
          onClick={onCreateEventClick}
        />
        <CreateEventResultDialog
          close={closeCreateResultDialog}
          isLoading={isLoading}
          isOpen={createResultDialogIsOpen}
          url={url}
          onClipboardButtonClick={onClipboardButtonClick}
        />
      </ButtonsWrapperForEventSettingsPage>
    </div>
  );
});
