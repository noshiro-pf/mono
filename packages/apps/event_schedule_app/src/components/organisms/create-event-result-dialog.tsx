import {
  AnchorButton,
  Button,
  Classes,
  Spinner,
  // eslint-disable-next-line import/no-deprecated
  Tooltip,
} from '@blueprintjs/core';
import { memoNamed, useState } from '@noshiro/react-utils';
import { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { dict } from '../../constants';
import { DialogWithMaxWidth } from '../bp';
import { ButtonsWrapperAlignEnd } from '../styled';

const dc = dict.createEventResultDialog;

type Props = Readonly<{
  isOpen: boolean;
  close: () => void;
  url: string;
  onClipboardButtonClick: () => void;
  isLoading: boolean;
}>;

export const CreateEventResultDialog = memoNamed<Props>(
  'CreateEventResultDialog',
  (props) => {
    const { state: linkIsUsed, setState: setLinkIsUsed } =
      useState<boolean>(false);

    const onClipboardButtonClick = useCallback(() => {
      setLinkIsUsed(true);
      props.onClipboardButtonClick();
    }, [props, setLinkIsUsed]);

    const onLinkClick = useCallback(() => {
      setLinkIsUsed(true);
    }, [setLinkIsUsed]);

    useEffect(() => {
      if (!props.isOpen) {
        setLinkIsUsed(false);
      }
    }, [props.isOpen, setLinkIsUsed]);

    return (
      <DialogWithMaxWidth
        canEscapeKeyClose={false}
        hasBackdrop={false}
        icon={'timeline-events'}
        isCloseButtonShown={false}
        isOpen={props.isOpen}
        title={props.isLoading ? dc.titleLoading : dc.title}
      >
        <div className={Classes.DIALOG_BODY}>
          {props.isLoading ? (
            <Spinner />
          ) : (
            <>
              <p>{dc.description}</p>
              <UrlWrapper>
                <div>{'URL: '}</div>
                <AnchorWrapper>
                  <Anchor
                    href={props.url}
                    rel={'noopener noreferrer'}
                    target={'_blank'}
                    onClick={onLinkClick}
                  >
                    {props.url}
                  </Anchor>
                </AnchorWrapper>
                <div>
                  <Tooltip content={dc.clipboardButton}>
                    <Button
                      icon={'clipboard'}
                      minimal={true}
                      onClick={onClipboardButtonClick}
                    />
                  </Tooltip>
                </div>
              </UrlWrapper>
            </>
          )}
        </div>

        <div className={Classes.DIALOG_FOOTER}>
          <ButtonsWrapperAlignEnd>
            <Button
              disabled={props.isLoading || !linkIsUsed}
              intent={'none'}
              title={
                props.isLoading || !linkIsUsed
                  ? dc.whyButtonIsDisabled
                  : undefined
              }
              onClick={props.close}
            >
              {dc.back}
            </Button>

            <AnchorButton
              href={props.url}
              intent={'primary'}
              loading={props.isLoading}
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
  }
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
