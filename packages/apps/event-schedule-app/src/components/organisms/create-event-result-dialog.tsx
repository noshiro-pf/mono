import {
  AnchorButton,
  Button,
  Classes,
  Spinner,
  Tooltip,
} from '@blueprintjs/core';
import { DialogWithMaxWidth } from '@noshiro/react-blueprintjs-utils';
import { CreateEventScheduleStore } from '../../store';
import { ButtonsWrapperAlignEnd } from '../styled';

const dc = dict.createEventResultDialog;

type Props = Readonly<{
  isOpen: boolean;
  url: string;
  isLoading: boolean;
}>;

export const CreateEventResultDialog = memoNamed<Props>(
  'CreateEventResultDialog',
  ({ isLoading, isOpen, url }) => {
    const { state: linkIsUsed, setState: setLinkIsUsed } =
      useState<boolean>(false);

    const onClipboardButtonClick = useCallback(() => {
      setLinkIsUsed(true);
      CreateEventScheduleStore.onClipboardButtonClick();
    }, [setLinkIsUsed]);

    const onLinkClick = useCallback(() => {
      setLinkIsUsed(true);
    }, [setLinkIsUsed]);

    useEffect(() => {
      if (!isOpen) {
        setLinkIsUsed(false);
      }
    }, [isOpen, setLinkIsUsed]);

    return (
      <DialogWithMaxWidth
        canEscapeKeyClose={false}
        icon={'timeline-events'}
        isCloseButtonShown={false}
        isOpen={isOpen}
        title={isLoading ? dc.titleLoading : dc.title}
      >
        <div
          className={Classes.DIALOG_BODY}
          data-e2e={'create-event-result-dialog-body'}
        >
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <p>{dc.description}</p>
              <div
                css={css`
                  display: flex;
                  align-items: center;
                  flex-wrap: nowrap;
                `}
                data-e2e={'url-wrapper'}
              >
                <div>{'URL: '}</div>
                <div
                  css={css`
                    flex-shrink: 1;
                    min-width: 0;
                  `}
                >
                  <a
                    css={css`
                      display: block;
                      margin: 0 5px;
                      text-overflow: ellipsis;
                      overflow: hidden;
                      white-space: nowrap;
                    `}
                    href={url}
                    rel={'noopener noreferrer'}
                    target={'_blank'}
                    onClick={onLinkClick}
                  >
                    {url}
                  </a>
                </div>
                <div>
                  <Tooltip content={dc.clipboardButton}>
                    <Button
                      data-e2e={'clipboard-button'}
                      icon={'clipboard'}
                      minimal={true}
                      onClick={onClipboardButtonClick}
                    />
                  </Tooltip>
                </div>
              </div>
            </>
          )}
        </div>

        <div
          className={Classes.DIALOG_FOOTER}
          data-e2e={'create-event-result-dialog-footer'}
        >
          <ButtonsWrapperAlignEnd>
            <Button
              data-e2e={'back-button'}
              disabled={isLoading || !linkIsUsed}
              intent={'none'}
              title={
                isLoading || !linkIsUsed ? dc.whyButtonIsDisabled : undefined
              }
              onClick={CreateEventScheduleStore.closeCreateResultDialog}
            >
              {dc.back}
            </Button>

            <AnchorButton
              data-e2e={'open-answer-page-button'}
              href={url}
              intent={'primary'}
              loading={isLoading}
              rel={'noopener noreferrer'}
              target={'_blank'}
              onClick={onLinkClick}
            >
              {dc.openEventPageCreated}
            </AnchorButton>
          </ButtonsWrapperAlignEnd>
        </div>
      </DialogWithMaxWidth>
    );
  },
);
