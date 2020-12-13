import { Popover } from '@blueprintjs/core';
import { memoNamed, useBooleanState } from '@mono/react-utils';
import React from 'react';
import styled from 'styled-components';
import { texts } from '../../../constants/texts';
import { BpButton } from '../../atoms/blueprint-js-wrapper/bp-button';
import { ButtonsWrapperAlignEnd } from '../../molecules/buttons-wrapper';

interface Props {
  comment: string;
}

export const CommentButton = memoNamed<Props>('CommentButton', (props) => {
  const [isOpen, open, close] = useBooleanState(false);

  return (
    <Popover
      isOpen={isOpen}
      onClose={close}
      canEscapeKeyClose={true}
      position={'top'}
      minimal={true}
      target={
        <BpButton minimal={true} icon={'comment'} small={true} onClick={open} />
      }
      content={
        <ContentRoot>
          <Comment>{props.comment}</Comment>
          <ButtonsWrapperAlignEnd>
            <BpButton
              type='button'
              intent='none'
              onClick={close}
              text={texts.buttonText.close}
            />
          </ButtonsWrapperAlignEnd>
        </ContentRoot>
      }
    ></Popover>
  );
});

const ContentRoot = styled.div`
  padding: 10px;
  max-width: 250px;
`;

const Comment = styled.div`
  margin: 10px;
  overflow-wrap: anywhere;
  white-space: pre-line;
`;
