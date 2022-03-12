// eslint-disable-next-line import/no-deprecated
import { Button, Popover } from '@blueprintjs/core';
import { memoNamed, useBoolState } from '@noshiro/react-utils';
import styled from 'styled-components';
import { dict } from '../../../constants';
import { ButtonsWrapperAlignEnd } from '../../styled';

type Props = Readonly<{
  comment: string;
}>;

export const CommentButton = memoNamed<Props>('CommentButton', (props) => {
  const {
    state: isOpen,
    setTrue: handleOpen,
    setFalse: handleClose,
  } = useBoolState(false);

  return (
    <Popover
      canEscapeKeyClose={true}
      content={
        <ContentRoot>
          <Comments>{props.comment}</Comments>
          <ButtonsWrapperAlignEnd>
            <Button
              intent='none'
              text={dict.common.buttonText.close}
              onClick={handleClose}
            />
          </ButtonsWrapperAlignEnd>
        </ContentRoot>
      }
      isOpen={isOpen}
      minimal={true}
      placement={'top'}
      onClose={handleClose}
    >
      <Button
        icon={'comment'}
        minimal={true}
        small={true}
        onClick={handleOpen}
      />
    </Popover>
  );
});

const ContentRoot = styled.div`
  padding: 10px;
  max-width: 250px;
`;

const Comments = styled.div`
  margin: 10px;
  overflow-wrap: anywhere;
  white-space: pre-line;
`;
