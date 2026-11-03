import { Alert, Button } from 'blueprint-synstate';
import { createState } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';
import { Description } from '../../atoms/index.mjs';
import { maxWidthModalClass } from '../../styled/index.mjs';

const dc = dict.eventListPage;

type Props = Readonly<{
  archiveOrUnArchive: 'archive' | 'unarchive';
  onConfirm: () => void;
}>;

/**
 * Archives an event of the list, or takes it out of the archive, once
 * confirmed. Inside the item's link, so that no press here follows it.
 */
export const ArchiveEventButton = ({
  archiveOrUnArchive,
  onConfirm,
}: Props): JSX.Element => {
  const [isOpen$, setIsOpen] = createState(false);

  return (
    <>
      <Button
        icon={archiveOrUnArchive}
        title={constant(dc[archiveOrUnArchive])}
        variant={constant('minimal')}
        onClick={(event) => {
          stop(event);

          setIsOpen(true);
        }}
      />
      <Alert
        canEscapeKeyCancel
        canOutsideClickCancel
        cancelButtonText={constant(dict.common.buttonText.cancel)}
        class={maxWidthModalClass}
        confirmButtonText={constant(dc[archiveOrUnArchive])}
        icon={archiveOrUnArchive}
        intent={'primary'}
        isOpen={isOpen$}
        onCancel={(event) => {
          stop(event);

          setIsOpen(false);
        }}
        onConfirm={(event) => {
          stop(event);

          setIsOpen(false);

          onConfirm();
        }}
      >
        <p>{constant(dc.confirmationMessage[archiveOrUnArchive].title)}</p>
        <Description
          text={constant(
            dc.confirmationMessage[archiveOrUnArchive].description,
          )}
        />
      </Alert>
    </>
  );
};

/** Keeps a press inside the card from opening the event as well. */
const stop = (event: Event | undefined): void => {
  event?.preventDefault();

  event?.stopPropagation();
};
