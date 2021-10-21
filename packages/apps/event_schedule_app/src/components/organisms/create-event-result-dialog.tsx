import {
  AnchorButton,
  Button,
  Classes,
  Spinner,
  Tooltip,
} from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { texts } from '../../constants';
import { DialogWithMaxWidth } from '../bp';
import { ButtonsWrapperAlignEnd } from '../styled';

const vt = texts.createEventResultDialog;

type Props = Readonly<{
  isOpen: boolean;
  close: () => void;
  url: string;
  onClipboardButtonClick: () => void;
  isLoading: boolean;
}>;

export const CreateEventResultDialog = memoNamed<Props>(
  'CreateEventResultDialog',
  (props) => (
    <DialogWithMaxWidth
      canEscapeKeyClose={false}
      hasBackdrop={false}
      icon='timeline-events'
      isCloseButtonShown={false}
      isOpen={props.isOpen}
      title={props.isLoading ? vt.titleLoading : vt.title}
    >
      <div className={Classes.DIALOG_BODY}>
        {props.isLoading ? (
          <Spinner />
        ) : (
          <>
            <p>{vt.description}</p>
            <UrlWrapper>
              <div>{'URL: '}</div>
              <AnchorWrapper>
                <Anchor
                  href={props.url}
                  rel='noopener noreferrer'
                  target='_blank'
                >
                  {props.url}
                </Anchor>
              </AnchorWrapper>
              <div>
                <Tooltip content={vt.clipboardButton}>
                  <Button
                    icon={'clipboard'}
                    minimal={true}
                    onClick={props.onClipboardButtonClick}
                  />
                </Tooltip>
              </div>
            </UrlWrapper>
          </>
        )}
      </div>
      {props.isLoading ? undefined : (
        <div className={Classes.DIALOG_FOOTER}>
          <ButtonsWrapperAlignEnd>
            <AnchorButton intent={'none'} onClick={props.close}>
              {vt.back}
            </AnchorButton>
            <AnchorButton
              href={props.url}
              intent={'primary'}
              rel='noopener noreferrer'
              target='_blank'
            >
              {vt.openEventPageCreated}
            </AnchorButton>
          </ButtonsWrapperAlignEnd>
        </div>
      )}
    </DialogWithMaxWidth>
  )
);

const UrlWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
`;

const Anchor = styled.a`
  display: block;
  margin: 0 5px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const AnchorWrapper = styled.div`
  flex-shrink: 1;
  min-width: 0;
`;
