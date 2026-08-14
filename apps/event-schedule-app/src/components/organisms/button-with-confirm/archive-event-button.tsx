import { Button } from '@blueprintjs/core';
import { useBoolState } from 'better-react-use-state';
import * as React from 'react';
import { AlertWithMaxWidth } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { eventListItemTextColor } from '../../../constants/index.mjs';
import { Description } from '../../atoms/index.mjs';

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

    const archiveIconClick = React.useCallback(
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      (ev: React.MouseEvent<HTMLElement>) => {
        ev.preventDefault();

        ev.stopPropagation();

        handleOpen();
      },
      [handleOpen],
    );

    const onCancel = React.useCallback(
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      (ev?: React.SyntheticEvent<HTMLElement, Event>) => {
        ev?.preventDefault();

        ev?.stopPropagation();

        handleClose();
      },
      [handleClose],
    );

    const onConfirmHandler = React.useCallback(
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
          title={dc[archiveOrUnArchive]}
          variant={'minimal'}
          onClick={archiveIconClick}
        />
        <AlertWithMaxWidth
          canEscapeKeyCancel
          canOutsideClickCancel
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
