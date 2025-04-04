import { Button, Icon, Popover } from '@blueprintjs/core';
import { ButtonsWrapperAlignEnd } from '../../styled';

type Props = Readonly<{
  comment: string;
  useSmallButton?: boolean;
}>;

export const CommentButton = memoNamed<Props>(
  'CommentButton',
  ({ comment, useSmallButton = false }) => {
    const [isOpen, { setTrue: handleOpen, setFalse: handleClose }] =
      useBoolState(false);

    const popoverContent = useMemo(
      () => (
        <div
          css={css`
            padding: 10px;
            max-width: 250px;
          `}
        >
          <div
            css={css`
              margin: 10px;
              overflow-wrap: anywhere;
              white-space: pre-line;
            `}
          >
            {comment}
          </div>
          <ButtonsWrapperAlignEnd>
            <Button
              intent={'none'}
              text={dict.common.buttonText.close}
              onClick={handleClose}
            />
          </ButtonsWrapperAlignEnd>
        </div>
      ),
      [comment, handleClose],
    );

    return (
      <Popover
        canEscapeKeyClose={true}
        content={popoverContent}
        isOpen={isOpen}
        minimal={true}
        placement={'top'}
        onClose={handleClose}
      >
        {useSmallButton ? (
          <Button
            css={css`
              min-height: 16px !important;
              min-width: 16px !important;
            `}
            icon={icon}
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
      </Popover>
    );
  },
);

const icon = <Icon icon={'comment'} size={12} />;
