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
  const [isOpen, open, close] = useBooleanState(false);

  return (
    <Popover
      isOpen={isOpen}
      onClose={close}
      canEscapeKeyClose={true}
      placement={'top'}
      minimal={true}
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
    >
      <BpButton minimal={true} icon={'comment'} small={true} onClick={open} />
    </Popover>
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
