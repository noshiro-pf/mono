import { Button, Icon } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import { ButtonsWrapperAlignEnd } from '../../styled';

type Props = Readonly<{
  comment: string;
  useSmallButton?: boolean;
}>;

export const CommentButton = memoNamed<Props>(
  'CommentButton',
  ({ comment, useSmallButton = false }) => {
    const {
      state: isOpen,
      setTrue: handleOpen,
      setFalse: handleClose,
    } = useBoolState(false);

    return (
      <Popover2
        canEscapeKeyClose={true}
        content={
          <ContentRoot>
            <Comments>{comment}</Comments>
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
        {useSmallButton ? (
          <SmallButton
            icon={<Icon icon={'comment'} size={12} />}
            minimal={true}
            small={true}
            onClick={handleOpen}
          />
        ) : (
          <Button
            icon={'comment'}
            minimal={true}
            small={true}
            onClick={handleOpen}
          />
        )}
      </Popover2>
    );
  }
);

const ContentRoot = styled.div`
  padding: 10px;
  max-width: 250px;
`;

const Comments = styled.div`
  margin: 10px;
  overflow-wrap: anywhere;
  white-space: pre-line;
`;

const SmallButton = styled(Button)`
  min-height: 16px !important;
  min-width: 16px !important;
`;
