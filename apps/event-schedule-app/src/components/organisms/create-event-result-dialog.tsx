import {
  AnchorButton,
  Button,
  Dialog,
  Spinner,
  Tooltip,
} from 'blueprint-synstate';
import { createBooleanState, filter } from 'synstate';
import {
  constant,
  createAfterUpdate,
  deriveBindable,
  If,
  mapBindable,
  toObservable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { dict } from '../../constants/index.mjs';
import { CreateEventScheduleStore } from '../../store/index.mjs';
import {
  ButtonsWrapperAlignEnd,
  maxWidthModalClass,
} from '../styled/index.mjs';
import * as styles from './dialogs.module.css';

const dc = dict.createEventResultDialog;

type Props = Readonly<{
  isOpen: Bindable<boolean>;
  url: Bindable<string>;
  isLoading: Bindable<boolean>;
}>;

export const CreateEventResultDialog = ({
  isLoading,
  isOpen,
  url,
}: Props): JSX.Element => {
  const [linkIsUsed$, { setTrue: markLinkUsed, setFalse: resetLinkIsUsed }] =
    createBooleanState(false);

  const afterUpdate = createAfterUpdate();

  toObservable(isOpen)
    .pipe(filter((open) => !open))
    .subscribe(() => {
      afterUpdate(resetLinkIsUsed);
    });

  const backIsDisabled = deriveBindable(
    [isLoading, linkIsUsed$],
    (loading, used) => loading || !used,
  );

  return (
    <Dialog
      canEscapeKeyClose={false}
      class={maxWidthModalClass}
      icon={'timeline-events'}
      isCloseButtonShown={false}
      isOpen={isOpen}
      title={mapBindable(isLoading, (loading) =>
        loading ? dc.titleLoading : dc.title,
      )}
    >
      <div
        class={constant('bp6-dialog-body')}
        data-e2e={constant('create-event-result-dialog-body')}
      >
        <If
          cond={isLoading}
          else={
            <>
              <p>{constant(dc.description)}</p>
              <div
                class={constant(styles.urlRow)}
                data-e2e={constant('url-wrapper')}
              >
                <div>{constant('URL: ')}</div>
                <div class={constant(styles.urlCell)}>
                  <a
                    class={constant(styles.url)}
                    href={url}
                    rel={constant('noopener noreferrer')}
                    target={constant('_blank')}
                    onClick={markLinkUsed}
                  >
                    {url}
                  </a>
                </div>
                <div>
                  <Tooltip content={constant(dc.clipboardButton)}>
                    <Button
                      data-e2e={constant('clipboard-button')}
                      icon={'clipboard'}
                      variant={constant('minimal')}
                      onClick={() => {
                        markLinkUsed();

                        CreateEventScheduleStore.onClipboardButtonClick();
                      }}
                    />
                  </Tooltip>
                </div>
              </div>
            </>
          }
          then={<Spinner />}
        />
      </div>

      <div
        class={constant('bp6-dialog-footer')}
        data-e2e={constant('create-event-result-dialog-footer')}
      >
        <ButtonsWrapperAlignEnd>
          <Button
            data-e2e={constant('back-button')}
            disabled={backIsDisabled}
            intent={'none'}
            text={constant(dc.back)}
            title={mapBindable(backIsDisabled, (disabled) =>
              disabled ? dc.whyButtonIsDisabled : '',
            )}
            onClick={CreateEventScheduleStore.closeCreateResultDialog}
          />
          <AnchorButton
            data-e2e={constant('open-answer-page-button')}
            href={url}
            intent={'primary'}
            loading={isLoading}
            rel={'noopener noreferrer'}
            target={'_blank'}
            text={constant(dc.openEventPageCreated)}
            onClick={markLinkUsed}
          />
        </ButtonsWrapperAlignEnd>
      </div>
    </Dialog>
  );
};
