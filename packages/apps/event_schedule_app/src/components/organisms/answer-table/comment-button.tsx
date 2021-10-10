import { Popover } from '@blueprintjs/core';
import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed, useBooleanState } from '@noshiro/react-utils';
import styled from 'styled-components';
import { texts } from '../../../constants';
import { ButtonsWrapperAlignEnd } from '../../styled';

type Props = Readonly<{
  comment: string;
}>;

export const CommentButton = memoNamed<Props>('CommentButton', (props) => {
  const [isOpen, handleOpen, handleClose] = useBooleanState(false);

  return (
    <Popover
      canEscapeKeyClose={true}
      content={
        <ContentRoot>
          <Comments>{props.comment}</Comments>
          <ButtonsWrapperAlignEnd>
            <BpButton
              intent='none'
              text={texts.buttonText.close}
              type='button'
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
      <BpButton
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
