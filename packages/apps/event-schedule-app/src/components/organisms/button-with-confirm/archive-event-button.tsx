import { Button } from '@blueprintjs/core';
import { AlertWithMaxWidth } from '@noshiro/react-blueprintjs-utils';
import { eventListItemTextColor } from '../../../constants';
import { Description } from '../../atoms';

const dc = dict.eventListPage;

type Props = Readonly<{
  archiveOrUnArchive: 'archive' | 'unarchive';
  onConfirm: () => void;
}>;

export const ArchiveEventButton = memoNamed<Props>(
  'ArchiveEventButton',
  ({ archiveOrUnArchive, onConfirm }) => {
    const [isOpen, { setTrue: handleOpen, setFalse: handleClose }] =
      useBoolState(false);

    const archiveIconClick = useCallback(
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      (ev: React.MouseEvent<HTMLElement>) => {
        ev.preventDefault();
        ev.stopPropagation();
        handleOpen();
      },
      [handleOpen],
    );

    const onCancel = useCallback(
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      (ev?: React.SyntheticEvent<HTMLElement, Event>) => {
        ev?.preventDefault();
        ev?.stopPropagation();
        handleClose();
      },
      [handleClose],
    );

    const onConfirmHandler = useCallback(
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      (ev?: React.SyntheticEvent<HTMLElement, Event>) => {
        ev?.preventDefault();
        ev?.stopPropagation();

        handleClose();
        onConfirm();
      },
      [onConfirm, handleClose],
    );

    return (
      <>
        <Button
          color={eventListItemTextColor}
          icon={archiveOrUnArchive}
          minimal={true}
          title={dc[archiveOrUnArchive]}
          onClick={archiveIconClick}
        />
        <AlertWithMaxWidth
          canEscapeKeyCancel={true}
          canOutsideClickCancel={true}
          cancelButtonText={dict.common.buttonText.cancel}
          confirmButtonText={dc[archiveOrUnArchive]}
          icon={archiveOrUnArchive}
          intent={'primary'}
          isOpen={isOpen}
          onCancel={onCancel}
          onConfirm={onConfirmHandler}
        >
          <p>{dc.confirmationMessage[archiveOrUnArchive].title}</p>
          <Description
            text={dc.confirmationMessage[archiveOrUnArchive].description}
          />
        </AlertWithMaxWidth>
      </>
    );
  },
);
