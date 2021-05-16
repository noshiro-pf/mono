import { Popover } from '@blueprintjs/core';
import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed, useBooleanState } from '@noshiro/react-utils';
import styled from 'styled-components';
import { texts } from '../../../constants/texts';
import { ButtonsWrapperAlignEnd } from '../../molecules/buttons-wrapper';

type Props = Readonly<{
  comment: string;
}>;

export const CommentButton = memoNamed<Props>('CommentButton', (props) => {
  const [isOpen, handleOpen, handleClose] = useBooleanState(false);

  return (
    <Popover
      isOpen={isOpen}
      onClose={handleClose}
      canEscapeKeyClose={true}
      placement={'top'}
      minimal={true}
      content={
        <ContentRoot>
          <Comments>{props.comment}</Comments>
          <ButtonsWrapperAlignEnd>
            <BpButton
              type='button'
              intent='none'
              onClick={handleClose}
              text={texts.buttonText.close}
            />
          </ButtonsWrapperAlignEnd>
        </ContentRoot>
      }
    >
      <BpButton
        minimal={true}
        icon={'comment'}
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
